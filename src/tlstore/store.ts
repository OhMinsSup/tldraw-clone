import {
  Atom,
  Computed,
  Reactor,
  atom,
  computed,
  reactor,
  transact,
} from "signia";
import { IdOf, RecordId, UnknownRecord } from "./base-record";
import { objectMapEntries, objectMapFromEntries } from "../tlutils/object";
import { throttledRaf } from "../tlutils/raf";

type RecFromId<K extends RecordId<UnknownRecord>> = K extends RecordId<infer R>
  ? R
  : never;

/**
 * A diff describing the changes to a record.
 *
 * @public
 */
export type RecordsDiff<R extends UnknownRecord> = {
  added: Record<IdOf<R>, R>;
  updated: Record<IdOf<R>, [from: R, to: R]>;
  removed: Record<IdOf<R>, R>;
};

/**
 * A diff describing the changes to a collection.
 *
 * @public
 */
export type CollectionDiff<T> = { added?: Set<T>; removed?: Set<T> };

/**
 * An entry containing changes that originated either by user actions or remote changes.
 *
 * @public
 */
export type HistoryEntry<R extends UnknownRecord = UnknownRecord> = {
  changes: RecordsDiff<R>;
  source: "user" | "remote";
};

export type ComputedCache<Data, R extends UnknownRecord> = {
  get(id: IdOf<R>): Data | undefined;
};

/**
 * A function that will be called when the history changes.
 *
 * @public
 */
export type StoreListener<R extends UnknownRecord> = (
  entry: HistoryEntry<R>
) => void;

/**
 * A serialized snapshot of the record store's values.
 *
 * @public
 */
export type StoreSnapshot<R extends UnknownRecord> = Record<IdOf<R>, R>;

/** @public */
export type StoreValidator<R extends UnknownRecord> = {
  validate: (record: unknown) => R;
};

/** @public */
export type StoreValidators<R extends UnknownRecord> = {
  [K in R["typeName"]]: StoreValidator<Extract<R, { typeName: K }>>;
};

/** @public */
export type StoreError = {
  error: Error;
  phase: "initialize" | "createRecord" | "updateRecord" | "tests";
  recordBefore?: unknown;
  recordAfter: unknown;
  isExistingValidationIssue: boolean;
};

/** @internal */
export type StoreRecord<S extends Store<any>> = S extends Store<infer R>
  ? R
  : never;

/**
 * A store of records.
 *
 * @public
 */
export class Store<R extends UnknownRecord = UnknownRecord, Props = unknown> {
  /**
   * An atom containing the store's atoms.
   *
   * @internal
   * @readonly
   */
  private readonly atoms = atom("store_atoms", {} as Record<IdOf<R>, Atom<R>>);

  /**
   * An atom containing the store's history.
   *
   * @public
   * @readonly
   */
  readonly history: Atom<number, RecordsDiff<R>> = atom("history", 0, {
    historyLength: 1000,
  });

  /**
   * A StoreQueries instance for this store.
   *
   * @public
   * @readonly
   */
  readonly query = new StoreQueries<R>(this.atoms, this.history);

  /**
   * A set containing listeners that have been added to this store.
   *
   * @internal
   */
  private listeners = new Set<StoreListener<R>>();

  /**
   * An array of history entries that have not yet been flushed.
   *
   * @internal
   */
  private historyAccumulator = new HistoryAccumulator<R>();

  /**
   * A reactor that responds to changes to the history by squashing the accumulated history and
   * notifying listeners of the changes.
   *
   * @internal
   */
  private historyReactor: Reactor;

  readonly schema: StoreSchema<R, Props>;

  readonly props: Props;

  constructor(config: {
    /** The store's initial data. */
    initialData?: StoreSnapshot<R>;
    /**
     * A map of validators for each record type. A record's validator will be called when the record
     * is created or updated. It should throw an error if the record is invalid.
     */
    schema: StoreSchema<R, Props>;
    props: Props;
  }) {
    const { initialData, schema } = config;

    this.schema = schema;
    this.props = config.props;

    if (initialData) {
      this.atoms.set(
        objectMapFromEntries(
          objectMapEntries(initialData).map(([id, record]) => [
            id,
            atom(
              "atom:" + id,
              this.schema.validateRecord(this, record, "initialize", null)
            ),
          ])
        )
      );
    }

    this.historyReactor = reactor(
      "Store.historyReactor",
      () => {
        // deref to make sure we're subscribed regardless of whether we need to propagate
        this.history.value;
        // If we have accumulated history, flush it and update listeners
        this._flushHistory();
      },
      { scheduleEffect: (cb) => throttledRaf(cb) }
    );
  }
}

/**
 * Squash a collection of diffs into a single diff.
 *
 * @param diffs - An array of diffs to squash.
 * @returns A single diff that represents the squashed diffs.
 * @public
 */
export function squashRecordDiffs<T extends UnknownRecord>(
  diffs: RecordsDiff<T>[]
): RecordsDiff<T> {
  const result = { added: {}, removed: {}, updated: {} } as RecordsDiff<T>;

  for (const diff of diffs) {
    for (const [id, value] of objectMapEntries(diff.added)) {
      if (result.removed[id]) {
        const original = result.removed[id];
        delete result.removed[id];
        if (original !== value) {
          result.updated[id] = [original, value];
        }
      } else {
        result.added[id] = value;
      }
    }

    for (const [id, [_from, to]] of objectMapEntries(diff.updated)) {
      if (result.added[id]) {
        result.added[id] = to;
        delete result.updated[id];
        delete result.removed[id];
        continue;
      }
      if (result.updated[id]) {
        result.updated[id][1] = to;
        delete result.removed[id];
        continue;
      }

      result.updated[id] = diff.updated[id];
      delete result.removed[id];
    }

    for (const [id, value] of objectMapEntries(diff.removed)) {
      // the same record was added in this diff sequence, just drop it
      if (result.added[id]) {
        delete result.added[id];
      } else if (result.updated[id]) {
        result.removed[id] = result.updated[id][0];
        delete result.updated[id];
      } else {
        result.removed[id] = value;
      }
    }
  }

  return result;
}

/**
 * Collect all history entries by their sources.
 *
 * @param entries - The array of history entries.
 * @returns A map of history entries by their sources.
 * @public
 */
function squashHistoryEntries<T extends UnknownRecord>(
  entries: HistoryEntry<T>[]
): HistoryEntry<T>[] {
  const result: HistoryEntry<T>[] = [];

  let current = entries[0];
  let entry: HistoryEntry<T>;

  for (let i = 1, n = entries.length; i < n; i++) {
    entry = entries[i];

    if (current.source !== entry.source) {
      result.push(current);
      current = entry;
    } else {
      current = {
        source: current.source,
        changes: squashRecordDiffs([current.changes, entry.changes]),
      };
    }
  }

  result.push(current);

  return result;
}

/** @public */
export function reverseRecordsDiff(diff: RecordsDiff<any>) {
  const result: RecordsDiff<any> = {
    added: diff.removed,
    removed: diff.added,
    updated: {},
  };
  for (const [from, to] of Object.values(diff.updated)) {
    result.updated[from.id] = [to, from];
  }
  return result;
}

class HistoryAccumulator<T extends UnknownRecord> {
  private _history: HistoryEntry<T>[] = [];

  private _inteceptors: Set<(entry: HistoryEntry<T>) => void> = new Set();

  intercepting(fn: (entry: HistoryEntry<T>) => void) {
    this._inteceptors.add(fn);
    return () => {
      this._inteceptors.delete(fn);
    };
  }

  add(entry: HistoryEntry<T>) {
    this._history.push(entry);
    for (const interceptor of this._inteceptors) {
      interceptor(entry);
    }
  }

  flush() {
    const history = squashHistoryEntries(this._history);
    this._history = [];
    return history;
  }

  clear() {
    this._history = [];
  }

  hasChanges() {
    return this._history.length > 0;
  }
}

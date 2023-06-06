import { RecordType } from "./record-type";
import { Store } from "./store";

type ExtractRecordType<T extends Store<any>> = T extends Store<infer R>
  ? R
  : never;

type ExtractR<T extends RecordType<any, any>> = T extends RecordType<
  infer S,
  any
>
  ? S
  : never;

/**
 * Get the type of all records in a record store.
 *
 * @public
 */
export type AllRecords<T extends Store<any>> = ExtractR<ExtractRecordType<T>>;

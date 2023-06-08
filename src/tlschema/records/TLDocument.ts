import { BaseRecord, RecordId } from "../../tlstore/base-record";
import { defineMigrations } from "../../tlstore/migrate";
import { createRecordType } from "../../tlstore/record-type";
import { T } from "../../tlvalidate";

/**
 * TLDocument
 *
 * @public
 */
export interface TLDocument
  extends BaseRecord<"document", RecordId<TLDocument>> {
  gridSize: number;
  name: string;
}

/** @internal */
export const documentValidator: T.Validator<TLDocument> = T.model(
  "document",
  T.object({
    typeName: T.literal("document"),
    id: T.literal("document:document" as RecordId<TLDocument>),
    gridSize: T.number,
    name: T.string,
  })
);

const Versions = {
  AddName: 1,
} as const;

/** @internal */
export const documentMigrations = defineMigrations({
  currentVersion: Versions.AddName,
  migrators: {
    [Versions.AddName]: {
      up: (document: TLDocument) => {
        return { ...document, name: "" };
      },
      down: ({ name: _, ...document }: TLDocument) => {
        return document;
      },
    },
  },
});

/** @public */
export const DocumentRecordType = createRecordType<TLDocument>("document", {
  migrations: documentMigrations,
  validator: documentValidator,
  scope: "document",
}).withDefaultProperties(
  (): Omit<TLDocument, "id" | "typeName"> => ({
    gridSize: 10,
    name: "",
  })
);

// all document records have the same ID: 'document:document'
/** @public */
export const TLDOCUMENT_ID: RecordId<TLDocument> =
  DocumentRecordType.createCustomId("document");

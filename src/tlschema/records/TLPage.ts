import { BaseRecord, RecordId } from "../../tlstore/base-record";
import { defineMigrations } from "../../tlstore/migrate";
import { createRecordType } from "../../tlstore/record-type";
import { T } from "../../tlvalidate";
import { idValidator } from "../misc/id-validator";

/**
 * TLPage
 *
 * @public
 */
export interface TLPage extends BaseRecord<"page", TLPageId> {
  name: string;
  index: string;
}

/** @public */
export type TLPageId = RecordId<TLPage>;

/** @internal */
export const pageIdValidator = idValidator<TLPageId>("page");

/** @internal */
export const pageValidator: T.Validator<TLPage> = T.model(
  "page",
  T.object({
    typeName: T.literal("page"),
    id: pageIdValidator,
    name: T.string,
    index: T.string,
  })
);
/** @internal */
export const pageMigrations = defineMigrations({});

/** @public */
export const PageRecordType = createRecordType<TLPage>("page", {
  validator: pageValidator,
  migrations: pageMigrations,
  scope: "document",
});

/** @public */
export function isPageId(id: string): id is TLPageId {
  return PageRecordType.isId(id);
}

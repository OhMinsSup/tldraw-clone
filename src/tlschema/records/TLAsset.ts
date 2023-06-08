import { RecordId } from "../../tlstore/base-record";
import { defineMigrations } from "../../tlstore/migrate";
import { createRecordType } from "../../tlstore/record-type";
import { T } from "../../tlvalidate";
import { TLBaseAsset } from "../assets/TLBaseAsset";
import {
  TLBookmarkAsset,
  bookmarkAssetMigrations,
  bookmarkAssetValidator,
} from "../assets/TLBookmarkAsset";
import {
  TLImageAsset,
  imageAssetMigrations,
  imageAssetValidator,
} from "../assets/TLImageAsset";
import {
  TLVideoAsset,
  videoAssetMigrations,
  videoAssetValidator,
} from "../assets/TLVideoAsset";

/** @public */
export type TLAsset = TLImageAsset | TLVideoAsset | TLBookmarkAsset;

/** @internal */
export const assetValidator: T.Validator<TLAsset> = T.model(
  "asset",
  T.union("type", {
    image: imageAssetValidator,
    video: videoAssetValidator,
    bookmark: bookmarkAssetValidator,
  })
);

/** @internal */
export const assetMigrations = defineMigrations({
  subTypeKey: "type",
  subTypeMigrations: {
    image: imageAssetMigrations,
    video: videoAssetMigrations,
    bookmark: bookmarkAssetMigrations,
  },
});

/** @public */
export type TLAssetPartial<T extends TLAsset = TLAsset> = T extends T
  ? {
      id: TLAssetId;
      type: T["type"];
      props?: Partial<T["props"]>;
    } & Partial<Omit<T, "type" | "id" | "props">>
  : never;

/** @public */
export const AssetRecordType = createRecordType<TLAsset>("asset", {
  migrations: assetMigrations,
  validator: assetValidator,
  scope: "document",
});

/** @public */
export type TLAssetId = RecordId<TLBaseAsset<any, any>>;

/** @public */
export type TLAssetShape = Extract<TLShape, { props: { assetId: TLAssetId } }>;

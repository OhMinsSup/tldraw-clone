import { defineMigrations } from "../../tlstore/migrate";
import { T } from "../../tlvalidate";
import { opacityValidator, TLOpacityType } from "../styles/TLOpacityStyle";
import { createShapeValidator, TLBaseShape } from "./TLBaseShape";

/** @public */
export type TLGroupShapeProps = {
  opacity: TLOpacityType;
};

/** @public */
export type TLGroupShape = TLBaseShape<"group", TLGroupShapeProps>;

/** @internal */
export const groupShapeValidator: T.Validator<TLGroupShape> =
  createShapeValidator(
    "group",
    T.object({
      opacity: opacityValidator,
    })
  );

/** @internal */
export const groupShapeMigrations = defineMigrations({});

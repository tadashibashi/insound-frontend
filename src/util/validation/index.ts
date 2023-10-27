/**
 * Export validation functionality for user convenience
 */
import type {TSchema, Static} from "@sinclair/typebox";
import {TypeCompiler, TypeCheck} from "@sinclair/typebox/compiler";
import {Value} from "@sinclair/typebox/value";
import { InsoundTypeBuilder } from "./insound";

/**
 * Shorthand to compile a schema into an efficient type-checker
 * @param schema -- TypeBox schema
 */
function compile<T extends TSchema>(schema: T) {
    return TypeCompiler.Compile(schema);
}

// Contains custom schema components + inherits the rest from TypeBox class
// Users can import 't', and create schemas with `t.Object()` etc.
const t = new InsoundTypeBuilder();

export {Value, TypeCheck, compile, t};
export type {TSchema, Static};

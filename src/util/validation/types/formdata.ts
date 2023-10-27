import { Kind } from "@sinclair/typebox";
import type {PropertiesReduce, SchemaOptions, TProperties } from "@sinclair/typebox";
import { Value, t, type TSchema } from "..";

/**
 * Converts a FormData structure to a regular JS object.
 * @param data
 */
export function formDataToObject(data: FormData): Record<string, FormDataEntryValue | FormDataEntryValue[]> {
    const res: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};

    data.forEach( (value, key) => {
        if (res[key]) {
            if (Array.isArray(res[key]))
                (res[key] as FormDataEntryValue[]).push(value);
            else 
                res[key] = [res[key] as FormDataEntryValue, value];
        } else {
            res[key] = value;
        }
    });

    return res;
}

export interface TFormData<T extends TProperties> extends TSchema {
    [Kind]: "FormData";
    static: PropertiesReduce<T, this['params']>;
    properties: T;
}

export function FormDataCheck<T extends TProperties>(opts: SchemaOptions = {}) {
    return function(schema: TFormData<T>, value: unknown) {
        if ( !(value instanceof FormData) ) return false;

        return Value.Check(t.Object(schema.properties, opts), formDataToObject(value));
    }
}

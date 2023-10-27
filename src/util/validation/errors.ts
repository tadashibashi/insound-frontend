import { ValueErrorIterator } from "@sinclair/typebox/errors";
import { type Static, type TSchema, TypeCheck } from ".";

/**
 * This class describes a validation error.
 *
 * @class      ValidationError
 */
export class ValidationError extends Error {
    errors: Record<string, string[]>;
    
    constructor(errors?: Record<string, string[]>) {
        super("Form validation error.");

        this.errors = errors ? errors : {};
    }

    /**
     * Create a ValidationError from a ValueErrorIterator retrieved from
     * a call to a TypeCheck's Errors function.
     *
     * @param      {ValueErrorIterator}  it      The errors iterator
     */
    static from(it: ValueErrorIterator) {
        const ve = new ValidationError();

            // collect errors if a value errors iterator was passed in


        for (const e of it) {
            const path = e.path.substring(1); // ignore the beginning slash
            if ( !(path in ve.errors) ) {
                ve.errors[path] = [];
            }

            ve.errors[path].push(e.message);
        }

        return ve;
    }

}

export function getErrors<T extends TSchema>(validator: TypeCheck<T>, value: unknown): Record<string, string[]> | undefined {
    const errors: Record<string, string[]> = {};

    // get error iterator from the validator
    const errorIt = validator.Errors(value);

    // no errors?
    if (!errorIt.First()) return undefined;

    // collect errors in a record format
    for (const e of errorIt) {
        const path = e.path.substring(1);
        if (!errors[path])
            errors[path] = [];
        errors[path].push(e.message);
    }

    return errors;
}

/**
 * Guards a control path from non-conforming data.
 * If a value does not pass a validation check, it will throw a validation error
 *
 * @param      {TypeCheck<T>}  validator  The validator
 * @param      {unknown}       value      The value
 */
export function guard<T extends TSchema>(validator: TypeCheck<T>, value: unknown): value is Static<T> {
    if (!validator.Check(value)) {
        throw new ValidationError(getErrors(validator, value));
    }

    return true;
}

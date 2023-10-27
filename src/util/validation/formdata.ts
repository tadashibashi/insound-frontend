import { type TObject } from "@sinclair/typebox";
import { type TypeCheck } from ".";
import { ValidationError } from "./errors";
import { formDataToObject } from "./types/formdata";

/**
 * Checks if form data matches a compiled TypeBox type check
 */
export function validateForm<T extends TObject>(check: TypeCheck<T>, value: FormData): boolean {
    return check.Check(formDataToObject(value));
}

/**
 * Gets form errors from a failed validation, or undefined if no errors
 *
 * @param      check   The validation to run
 * @param      value   The form data to test
 * @return     form errors.
 */
export function getFormErrors<T extends TObject>(check: TypeCheck<T>, value: FormData): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    for (const e of check.Errors(formDataToObject(value))) {
        const path = e.path.substring(1);
        if (!errors[path])
            errors[path] = [];
        errors[path].push(e.message);
    }

    return errors;
}



/**
 * Ensure that form data matches the correct type interface.
 * Throws an exception containing errors if form validation didn't pass.
 *
 * Helper runs {@link validateForm} and throws.
 *
 * @param      check   The validation
 * @param      value   The form data
 */
export function guardForm<T extends TObject>(check: TypeCheck<T>, value: FormData) {
    if (!validateForm(check, value)) {
        throw new ValidationError(getFormErrors(check, value));
    }
}

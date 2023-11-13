import * as t from "yup";

export
const FormError = t.array(t.string().required()).required();

export
class FormErrors {
    errors: Record<string, string[]>;

    constructor() {
        this.errors = {};
    }

    static validate(obj: any)
    {
        const errors = new FormErrors();

        if (typeof obj === "object")
        {
            for (const [k, v] of Object.entries(obj.errors))
            {
                if (!FormError.isValidSync(v))
                    throw Error("Invalid FormErrors at key: " + k);
                errors.errors[k] = v;
            }
        }

        return new Promise(resolve => resolve(errors));
    }
}

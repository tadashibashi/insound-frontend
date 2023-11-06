import * as t from "yup";

export
const FormErrors = t.array(
    t.object({
        /**
         * Name of the field
         */
        name: t.string().required(),
        /**
         * For what reasons field failed validation
         */
        what: t.array(t.string().required()).required(),
    }).required()
).required();

export
type FormErrors = t.InferType<typeof FormErrors>;

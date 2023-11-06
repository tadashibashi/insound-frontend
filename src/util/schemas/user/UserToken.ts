/**
 * @file UserToken.ts
 * @description
 *     Validation for user token objects.
 */
import type { InferType } from "yup";
import * as t from "yup";

export const UserToken = t.object({
    _id: t.string()
        .required(),

    email: t.string()
        .required(),

    session: t.string()
        .required(),

    username: t.string()
        .required(),

    avatar: t.string()
        .required(),

    type: t.mixed()
        .oneOf(["user", "admin", "guest"])
        .required(),
}).required();


/**
 * Token stored in localstorage in the frontend as a JWT
 */
export type UserToken = InferType<typeof UserToken>;

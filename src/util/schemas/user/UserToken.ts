/**
 * @file UserToken.ts
 * @description
 *     Validation for user token objects.
 */
import type { InferType } from "yup";
import * as t from "yup";

export const UserToken = t.object({
    iat: t.number().required(),
    exp: t.number().required(),

    email: t.string()
        .required(),

    fingerprint: t.string()
        .required(),

    username: t.string(),

    displayName: t.string(),

    avatar: t.string(), // add this from the backend

    type: t.mixed()
        .oneOf(["User", "Admin", "Guest", "Unverified", "Staff"])
        .required(),
}).required();


/**
 * Token stored in localstorage in the frontend as a JWT
 */
export type UserToken = InferType<typeof UserToken>;

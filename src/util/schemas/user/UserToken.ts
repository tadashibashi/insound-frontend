/**
 * @file UserToken.ts
 * @description
 *     Validation for user token objects.
 */
import {compile, t} from "../../validation";
import type {Static} from "../../validation";


const UserTokenSchema = t.Object({
    _id: t.String(),
    email: t.String({type: "email"}),
    session: t.String(),
    username: t.String(),
    avatar: t.String(),
    type: t.Union([t.Literal("user"), t.Literal("admin"), t.Literal("guest")]),
});


/**
 * Token stored in localstorage in the frontend as a JWT
 */
export type UserToken = Static<typeof UserTokenSchema>;

export const UserToken = {
    Validator: compile(UserTokenSchema),
    Schema: UserTokenSchema,
};

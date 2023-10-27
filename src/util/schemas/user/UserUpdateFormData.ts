/**
 * @file UserUpdateFormData.ts
 * @description
 *     Validation for the data object used to update users.
 */
import { type Static, compile, t } from "../../validation";

const UserUpdateFormSchema = t.Object({
	email: t.Optional(t.String({type: "email"})),
	password: t.Optional(t.String({minLength: 3})),
	avatar: t.Optional(t.Upload()),
});

export type UserUpdateFormData = Static<typeof UserUpdateFormSchema>;

export namespace UserUpdateFormData {
	export const Validator = compile(UserUpdateFormSchema);
	export const Schema = UserUpdateFormSchema;
}

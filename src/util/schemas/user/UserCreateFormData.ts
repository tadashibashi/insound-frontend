/**
 * @file UserCreateFormData.ts
 * @description
 *     Validation for the data object used to create users.
 */
import { type Static, compile, t } from "../../validation";

const UserCreateFormSchema = t.Object({
	email: t.String({type: "email"}),
	password: t.String({minLength: 3}),
	password2: t.String(),
});

export type UserCreateFormData = Static<typeof UserCreateFormSchema>;

export namespace UserCreateFormData {
	export const Validator = compile(UserCreateFormSchema);
	export const Schema = UserCreateFormSchema;
}

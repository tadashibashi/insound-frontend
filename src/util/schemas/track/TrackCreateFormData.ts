/**
 * @file CreateFormData.ts
 * @description
 *     Validation for track creation data object
 */

import { type Static, compile, t } from "../../validation";

/**
 * Schema of a recipe to create a track. Sent via form data to the backend.
 */
const TrackCreateSchema = t.Object({
	/**
	 * Title of the track
	 */
	title: t.String({minLength: 1}),

	/**
	 * Array of file objects
	 */
	files: t.Uploads(),

	/**
	 * Array of layer names, or one layer name
	 */
	names: t.Union( [t.Array(t.String()), t.String()] ),
});

export type TrackCreateFormData = Static<typeof TrackCreateSchema>;

export namespace TrackCreateFormData {
	export const Validator = compile(TrackCreateSchema);
	export const Schema = TrackCreateSchema;
}

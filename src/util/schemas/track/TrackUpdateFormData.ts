/**
 * @file TrackUpdateFormData.ts
 * @description
 *     Validation for the data object used to update tracks.
 */

import { type Static, compile, t } from "../../validation";

const TrackUpdateSchema = t.Object({
    title: t.String({minLength: 1}),
    files: t.Uploads(),
    names: t.Union( [t.Array(t.String()), t.String()] ),
});

export type TrackUpdateFormData = Static<typeof TrackUpdateSchema>;

export namespace TrackUpdateFormData {
    export const Validator = compile(TrackUpdateSchema);
    export const Schema = TrackUpdateSchema;
}

/**
 * @file TrackAPI.ts
 * @description
 *     Contains the TrackAPI namespace for directly interfacing with the
 *     server track api. Should not be used by components directly. Instead,
 *     use TrackSrv.ts functions.
 */
import { FormErrors } from "../schemas/FormErrors";
import { TrackToken } from "../schemas/track/TrackToken";
import { request } from "./request";
import * as t from "yup";

export namespace TrackAPI {
    // endpoint root
    const ROOT = "/api/tracks/";

    /**
     * Create a track from form data.
     *
     * @param    formData  The form data
     * @return   promise with track data
     */
    export async function createOne(formData: FormData) {
        return await request(ROOT, "POST", formData,
            TrackToken, FormErrors);
    }

    /**
     * Reads a track by its id.
     *
     * @param     id      The track identifier
     * @return    promise with track data
     */
    export async function readOne(id: string) {
        return await request(ROOT + id, "GET", null,
            TrackToken, t.string().required());
    }

    /**
     * Patches/Updates a track.
     *
     * @param      id        The track identifier
     * @param      formData  The form data to update with
     * @return     promise with updated track data
     */
    export async function updateOne(id: string, formData: FormData) {
        return await request(ROOT + id, "PATCH", formData,
            TrackToken, FormErrors);
    }

    /**
     * Delete a track by its id.
     *
     * @param      {string}   id      The track identifier
     * @return     promise with boolean
     */
    export async function deleteOne(id: string) {
        return await request(ROOT + id, "DELETE", null,
            t.string().required(), t.string().required());
    }
}

/**
 * @file TrackSrv.ts
 * @description
 *     Contains functions usable by components for interacting with the tracks api
 */

import { TrackAPI } from "../api/TrackAPI";

export namespace TrackSrv {

    export async function create(formData: FormData) {
        const body = await TrackAPI.createOne(formData);
        console.log(body);

    }

}

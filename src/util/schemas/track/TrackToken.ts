import type { InferType } from "yup";
import * as t from "yup";

export const LayerToken = t.object({
    name: t.string()
        .required(),

    originalType: t.string()
        .required(),

    order: t.number()
        .required(),

}).required();

export const TrackToken = t.object({
    _id: t.string()
        .required(),

    title: t.string()
        .required(),

    layers: t.array(LayerToken)
        .required(),

    user: t.string()
        .required(),

    link: t.string()
        .required(),

}).required();

export type TrackToken = InferType<typeof TrackToken>;

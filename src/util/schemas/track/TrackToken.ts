import { Static, compile, t } from "../../validation";

const LayerSchema = t.Object({
    _id: t.String(),
    name: t.String(),
    originalType: t.String(),
    order: t.Number(),
});

const TrackSchema = t.Object({
    _id: t.String(),
    title: t.String(),
    layers: t.Array(LayerSchema),
    user: t.String(), // user id
    link: t.String(), // custom slug
});

export type TrackToken = Static<typeof TrackSchema>;

export const TrackToken = {
    Validator: compile(TrackSchema),
    Schema: TrackSchema,
};

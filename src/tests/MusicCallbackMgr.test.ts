import {describe, it, expect} from ".";
import { MusicCallbackMgr } from "../audio/src/ts/MusicCallbackMgr";
import { SignatureTrack } from "../audio/src/ts/SignatureTrack";

describe("60bpm marker test", () => {
    it("0 length track produces no markers", () => {
        const markers = new MusicCallbackMgr();
        markers.calculateMarkers([], new SignatureTrack, 0);

        expect(markers.markers.length).toBe(0);
    });

    it("0 length track with tempo markers produces no markers", () => {
        const tempoMarkers = [
            {
                position: 0,
                tempo: 60,
            },
            {
                position: 4,
                tempo: 120,
            },
        ];
        const markers = new MusicCallbackMgr();
        markers.calculateMarkers(tempoMarkers, new SignatureTrack, 0);

        expect(markers.markers.length).toBe(0);
    });

    it ("4 second track contains 4 markers at expected location", () => {
        const tempoMarkers = [
            {
                position: 0,
                tempo: 60,
            },
        ];
        const markers = new MusicCallbackMgr();
        markers.calculateMarkers(tempoMarkers, new SignatureTrack, 4);

        expect(markers.markers.length).toBe(4);
        if (markers.markers.length === 4)
        {
            expect(markers.markers[0].measure).toBe(1);
            expect(markers.markers[0].beat).toBe(1);
            expect(markers.markers[0].position).toBe(0);
            expect(markers.markers[1].measure).toBe(1);
            expect(markers.markers[1].beat).toBe(2);
            expect(markers.markers[1].position).toBe(1);
            expect(markers.markers[2].measure).toBe(1);
            expect(markers.markers[2].beat).toBe(3);
            expect(markers.markers[2].position).toBe(2);
            expect(markers.markers[3].measure).toBe(1);
            expect(markers.markers[3].beat).toBe(4);
            expect(markers.markers[3].position).toBe(3);
        }
    });

    it ("32 second track contains 32 markers with expected info", () => {
        const tempoMarkers = [
            {
                position: 0,
                tempo: 60,
            },
        ];
        const markers = new MusicCallbackMgr();
        markers.calculateMarkers(tempoMarkers, new SignatureTrack, 32);

        expect(markers.markers.length).toBe(32);
        if (markers.markers.length === 32)
        {
            for (let i = 0; i < 32; ++i)
            {
                expect(markers.markers[i].measure).toBe(Math.floor(i / 4) + 1);
                expect(markers.markers[i].beat).toBe(i % 4 + 1);
                expect(markers.markers[i].position).toBe(i);
            }
        }
    });
});

describe("varying tempo test", () => {
    it("Switch between 60 and 120 bpm", () => {
        const tempoMarkers = [
            {
                position: 0,
                tempo: 60,
            },
            {
                position: 2,
                tempo: 120,
            },
            {
                position: 3,
                tempo: 60,
            },
            {
                position: 5,
                tempo: 120,
            }
        ];

        const markers = new MusicCallbackMgr;
        markers.calculateMarkers(tempoMarkers, new SignatureTrack, 6);
        expect(markers.markers.length).toBe(8);
        if (markers.markers.length === 8)
        {
            const m = markers.markers;
            expect(m[0].position).toBe(0);
            expect(m[0].beat).toBe(1);
            expect(m[0].measure).toBe(1);
            expect(m[1].position).toBe(1);
            expect(m[1].beat).toBe(2);
            expect(m[1].measure).toBe(1);
            expect(m[2].position).toBe(2);
            expect(m[2].beat).toBe(3);
            expect(m[2].measure).toBe(1);
            expect(m[3].position).toBe(2.5);
            expect(m[3].beat).toBe(4);
            expect(m[3].measure).toBe(1);
            expect(m[4].position).toBe(3);
            expect(m[4].beat).toBe(1);
            expect(m[4].measure).toBe(2);
            expect(m[5].position).toBe(4);
            expect(m[5].beat).toBe(2);
            expect(m[5].measure).toBe(2);
        }
    });

    it("Switches between randomly spaced tempo (markers are off-beat)", () => {

        const tempoMarkers = [
            {
                position: 1.483,
                tempo: 113,
            },
            {
                position: 2.374,
                tempo: 94,
            },
            {
                position: 4.723,
                tempo: 119,
            },
        ];

        const markers = new MusicCallbackMgr;
        markers.calculateMarkers(tempoMarkers, new SignatureTrack, 4.808);

        expect(markers.markers.length).toBe(8);
        if (markers.markers.length === 8)
        {
            const m = markers.markers;
            expect(m[0].position).toBeCloseTo(0);
            expect(m[0].beat).toBe(1);
            expect(m[0].measure).toBe(1);
            expect(m[1].position).toBeCloseTo(0.6);
            expect(m[1].beat).toBe(2);
            expect(m[1].measure).toBe(1);
            expect(m[2].position).toBeCloseTo(1.2);
            expect(m[2].beat).toBe(3);
            expect(m[2].measure).toBe(1);
            expect(m[3].position).toBeCloseTo(1.763);
            expect(m[3].beat).toBe(4);
            expect(m[3].measure).toBe(1);
            expect(m[4].position).toBeCloseTo(2.294);
            expect(m[4].beat).toBe(1);
            expect(m[4].measure).toBe(2);
            expect(m[5].position).toBeCloseTo(2.916);
            expect(m[5].beat).toBe(2);
            expect(m[5].measure).toBe(2);
            expect(m[6].position).toBeCloseTo(3.554);
            expect(m[6].beat).toBe(3);
            expect(m[6].measure).toBe(2);
            expect(m[7].position).toBeCloseTo(4.193);
            expect(m[7].beat).toBe(4);
            expect(m[7].measure).toBe(2);
        }

    });

    it("varying tempos in the midst of time signature changes", () => {
        const signatures = new SignatureTrack;
        signatures.pushArray([
            {
                measure: 1,
                time: {
                    top: 4,
                    bottom: 4,
                }
            },
            {
                measure: 2,
                time: {
                    top: 3,
                    bottom: 8,
                }
            }
        ]);

        const tempoMarkers = [
            {
                position: 0,
                tempo: 120,
            },
            {
                position: .296,
                tempo: 96,
            },
            {
                position: .935,
                tempo: 135,
            },
            {
                position: 1.734,
                tempo: 92,
            },
            {
                position: 2.548,
                tempo: 115,
            },
            {
                position: 3.324,
                tempo: 134,
            }
        ];

        const markers = new MusicCallbackMgr;
        markers.calculateMarkers(tempoMarkers, signatures, 4.337);

        expect(markers.markers.length === 10);
        if (markers.markers.length === 10)
        {
            const m = markers.markers;
            expect(m[0].position).toBeCloseTo(0);
            expect(m[0].measure).toBe(1);
            expect(m[0].beat).toBe(1);
            expect(m[1].position).toBeCloseTo(.550);
            expect(m[1].measure).toBe(1);
            expect(m[1].beat).toBe(2);
            expect(m[2].position).toBeCloseTo(1.106);
            expect(m[2].measure).toBe(1);
            expect(m[2].beat).toBe(3);
            expect(m[3].position).toBeCloseTo(1.550);
            expect(m[3].measure).toBe(1);
            expect(m[3].beat).toBe(4);
            expect(m[4].position).toBeCloseTo(2.117);
            expect(m[4].measure).toBe(2);
            expect(m[4].beat).toBe(1);
            expect(m[5].position).toBeCloseTo(2.443);
            expect(m[5].measure).toBe(2);
            expect(m[5].beat).toBe(2);
            expect(m[6].position).toBeCloseTo(2.725);
            expect(m[6].measure).toBe(2);
            expect(m[6].beat).toBe(3);
            expect(m[7].position).toBeCloseTo(2.986);
            expect(m[7].measure).toBe(3);
            expect(m[7].beat).toBe(1);
            expect(m[8].position).toBeCloseTo(3.481);
            expect(m[8].measure).toBe(3);
            expect(m[8].beat).toBe(2);
            expect(m[9].position).toBeCloseTo(3.929);
            expect(m[9].measure).toBe(3);
            expect(m[9].beat).toBe(3);
        }
    });
});

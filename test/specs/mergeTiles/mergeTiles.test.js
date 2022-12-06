const { describe, expect, test } = require("@jest/globals");

const { mergeTiles } = require("../../../src/mergeTiles/mergeTiles");
const { GRID_SIZE } = require("../../constants/grid");

const sideEffectTiles = [
  {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: "0", zone: "0_0", zone_id: 0 },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [10, 10],
              [10, 4.5],
              [7, 5],
              [5, 10],
              [10, 10],
            ],
          ],
        },
      },
    ],
  },
  {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: "0", zone: "10_0", zone_id: 0 },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [10, 10],
              [15.571428571428571, 10],
              [13, 4],
              [10, 4.5],
              [10, 10],
            ],
          ],
        },
      },
    ],
  },
];

describe("mergeTiles", () => {
  test("returns the correct merged tiles for parts of a polygon", () => {
    expect(mergeTiles(sideEffectTiles, GRID_SIZE)).toEqual({});
  });
});

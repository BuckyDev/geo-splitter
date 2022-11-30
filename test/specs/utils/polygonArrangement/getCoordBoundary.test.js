const { describe, expect, test } = require("@jest/globals");
const {
  getCoordBoundary,
  getGridCoordBoundary,
} = require("../../../../src/utils/polygonArrangement/getCoordBoundary");
const { GRID_SIZE } = require("../../../constants/grid");

const GENERIC_TEST_COORD = [
  [
    [40, 10],
    [42, 13],
    [36, 16],
    [43, 18],
    [47, 17],
    [48, 12],
    [44, 8],
    [37, 5],
    [34, 8],
    [37, 12],
    [38, 9],
  ],
];

const SINGLE_TILE_TEST_COORD = [
  [
    [53, 23],
    [55, 21],
    [57, 27],
    [53, 28],
  ],
];

const DOUBLE_X_TILE_TEST_COORD = [
  [
    [40, 29],
    [45, 25],
    [42, 22],
    [37, 22],
    [35, 23],
    [38, 24],
    [42, 25],
    [40, 26],
  ],
];

const DOUBLE_Y_TILE_TEST_COORD = [
  [
    [37, 33],
    [34, 28],
    [32, 31],
  ],
];

describe("getCoordBoundary", () => {
  describe("getCoordBoundary", () => {
    test("returns the right coord boundary for a random polygon", () => {
      expect(getCoordBoundary(GENERIC_TEST_COORD)).toEqual({
        xMin: 34,
        xMax: 48,
        yMin: 5,
        yMax: 18,
      });
    });
  });
  describe("getGridCoordBoundary", () => {
    test("returns the right grid coord boundary for a polygon within a single tile", () => {
      expect(getGridCoordBoundary(SINGLE_TILE_TEST_COORD, GRID_SIZE)).toEqual({
        xMin: 50,
        xMax: 60,
        yMin: 20,
        yMax: 30,
      });
    });
    test("returns the right grid coord boundary for a polygon within a 2 horizontal tiles", () => {
      expect(getGridCoordBoundary(DOUBLE_X_TILE_TEST_COORD, GRID_SIZE)).toEqual(
        {
          xMin: 30,
          xMax: 50,
          yMin: 20,
          yMax: 30,
        }
      );
    });
    test("returns the right grid coord boundary for a polygon within a 2 vertical tiles", () => {
      expect(getGridCoordBoundary(DOUBLE_Y_TILE_TEST_COORD, GRID_SIZE)).toEqual(
        {
          xMin: 30,
          xMax: 40,
          yMin: 20,
          yMax: 40,
        }
      );
    });
    test("returns the right grid coord boundary for a random polygon", () => {
      expect(getGridCoordBoundary(GENERIC_TEST_COORD, GRID_SIZE)).toEqual({
        xMin: 30,
        xMax: 50,
        yMin: 0,
        yMax: 20,
      });
    });
  });
});

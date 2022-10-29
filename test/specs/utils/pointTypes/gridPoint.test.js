const { describe, expect, test } = require("@jest/globals");
const {
  GRID_POINT_TYPES,
} = require("../../../../src/constants/gridPointTypes");

const {
  isGridPoint,
  getGridPointType,
} = require("../../../../src/utils/pointTypes/gridPoint");
const { GRID_SIZE } = require("../../../constants");

describe("gridPoint", () => {
  describe("isGridPoint", () => {
    test("returns true for a point on a vertical gridline", () => {
      expect(isGridPoint([GRID_SIZE, 8], GRID_SIZE)).toBe(true);
    });
    test("returns true for a point on a horizontal gridline", () => {
      expect(isGridPoint([8, GRID_SIZE], GRID_SIZE)).toBe(true);
    });
    test("returns true for a point on horizontal and vertical gridlines", () => {
      expect(isGridPoint([GRID_SIZE, GRID_SIZE], GRID_SIZE)).toBe(true);
    });
    test("returns false for a point on neither horizontal or vertical gridlines", () => {
      expect(isGridPoint([8, 8], GRID_SIZE)).toBe(false);
    });
  });

  describe("getGridPointType", () => {
    test("returns 'VERTICAL' for a point on a vertical gridline", () => {
      expect(getGridPointType([GRID_SIZE, 8], GRID_SIZE)).toBe(
        GRID_POINT_TYPES.VERTICAL
      );
    });
    test("returns 'HORIZONTAL' for a point on a horizontal gridline", () => {
      expect(getGridPointType([8, GRID_SIZE], GRID_SIZE)).toBe(
        GRID_POINT_TYPES.HORIZONTAL
      );
    });
    test("returns 'BOTH' for a point on horizontal and vertical gridlines", () => {
      expect(getGridPointType([GRID_SIZE, GRID_SIZE], GRID_SIZE)).toBe(
        GRID_POINT_TYPES.BOTH
      );
    });
    test("returns 'NONE' for a point on neither horizontal or vertical gridlines", () => {
      expect(getGridPointType([8, 8], GRID_SIZE)).toBe(GRID_POINT_TYPES.NONE);
    });
  });
});

const { describe, expect, test } = require("@jest/globals");
const {
  areTwinGridPoints,
} = require("../../../../src/utils/pointArrangement/areTwinGridPoints");
const { GRID_SIZE } = require("../../../constants/grid");

describe("areTwinGridPoints", () => {
  describe("returns true if", () => {
    test("grid points are on same vertical grid line", () => {
      expect(areTwinGridPoints([10, 7], [10, 12], GRID_SIZE)).toBe(true);
      expect(areTwinGridPoints([10, 7], [10, 10], GRID_SIZE)).toBe(true);
      expect(areTwinGridPoints([10, 10], [10, 7], GRID_SIZE)).toBe(true);
    });
    test("grid points are on same horizontal grid line", () => {
      expect(areTwinGridPoints([7, 10], [12, 10], GRID_SIZE)).toBe(true);
      expect(areTwinGridPoints([7, 10], [10, 10], GRID_SIZE)).toBe(true);
      expect(areTwinGridPoints([10, 10], [7, 10], GRID_SIZE)).toBe(true);
    });
  });
  describe("returns false if", () => {
    test("any point is not a grid point", () => {
      expect(areTwinGridPoints([7, 9], [7, 10], GRID_SIZE)).toBe(false);
      expect(areTwinGridPoints([7, 10], [7, 9], GRID_SIZE)).toBe(false);
    });
    test("grid points are not on same vertical grid line", () => {
      expect(areTwinGridPoints([10, 7], [20, 12], GRID_SIZE)).toBe(false);
      expect(areTwinGridPoints([10, 7], [20, 7], GRID_SIZE)).toBe(false);
      expect(areTwinGridPoints([10, 10], [20, 7], GRID_SIZE)).toBe(false);
    });
    test("points are not on the same horizontal grid line", () => {
      expect(areTwinGridPoints([7, 10], [12, 20], GRID_SIZE)).toBe(false);
      expect(areTwinGridPoints([7, 10], [7, 20], GRID_SIZE)).toBe(false);
      expect(areTwinGridPoints([10, 10], [7, 20], GRID_SIZE)).toBe(false);
    });
  });
});

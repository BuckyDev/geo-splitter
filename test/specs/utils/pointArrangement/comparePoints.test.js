const { describe, expect, test } = require("@jest/globals");
const {
  haveDifferentXCoord,
  haveDifferentYCoord,
  areOnDifferentVerticalTiles,
  areOnDifferentHorizontalTiles,
} = require("../../../../src/utils/pointArrangement/comparePoints");
const { GRID_SIZE } = require("../../../constants/grid");

describe("comparePoints", () => {
  describe("haveDifferentXCoord", () => {
    test("returns true if all x coord of point list are diferent from x coord of point ref", () => {
      expect(
        haveDifferentXCoord(
          [1, 2],
          [
            [2, 3],
            [2, 4],
          ]
        )
      ).toBe(true);
      expect(
        haveDifferentXCoord(
          [1, 2],
          [
            [2, 2],
            [3, 2],
          ]
        )
      ).toBe(true);
    });
    test("returns false if any x coord of point list equals x coord of point ref", () => {
      expect(
        haveDifferentXCoord(
          [1, 2],
          [
            [1, 3],
            [2, 4],
          ]
        )
      ).toBe(false);
    });
  });
  describe("haveDifferentYCoord", () => {
    test("returns true if all y coord of point list are diferent from y coord of point ref", () => {
      expect(
        haveDifferentYCoord(
          [1, 2],
          [
            [2, 3],
            [2, 4],
          ]
        )
      ).toBe(true);
      expect(
        haveDifferentYCoord(
          [1, 2],
          [
            [2, 3],
            [3, 3],
          ]
        )
      ).toBe(true);
    });
    test("returns false if any y coord of point list equals y coord of point ref", () => {
      expect(
        haveDifferentYCoord(
          [1, 2],
          [
            [3, 2],
            [2, 4],
          ]
        )
      ).toBe(false);
    });
  });
  describe("areOnDifferentVerticalTiles", () => {
    test("returns true if point1 and point2 are strictly on different sides of a vertical gridline", () => {
      expect(areOnDifferentVerticalTiles([5, 7], [12, 7], GRID_SIZE)).toBe(
        true
      );
    });
    test("returns true if point1 and point2 are non-strictly on different sides of a vertical gridline", () => {
      expect(areOnDifferentVerticalTiles([5, 7], [10, 7], GRID_SIZE)).toBe(
        true
      );
    });
    test("returns false if point1 and point2 are strictly on the same side of a vertical gridline", () => {
      expect(areOnDifferentVerticalTiles([5, 7], [9, 7], GRID_SIZE)).toBe(
        false
      );
    });
    test("returns false if point1 and point2 are non-strictly on the same side of a vertical gridline", () => {
      expect(areOnDifferentVerticalTiles([10, 7], [15, 7], GRID_SIZE)).toBe(
        false
      );
    });
  });
  describe("areOnDifferentHorizontalTiles", () => {
    test("returns true if point1 and point2 are strictly on different sides of a vertical gridline", () => {
      expect(areOnDifferentHorizontalTiles([7, 5], [7, 12], GRID_SIZE)).toBe(
        true
      );
    });
    test("returns true if point1 and point2 are non-strictly on different sides of a vertical gridline", () => {
      expect(areOnDifferentHorizontalTiles([7, 5], [7, 10], GRID_SIZE)).toBe(
        true
      );
    });
    test("returns false if point1 and point2 are strictly on the same side of a vertical gridline", () => {
      expect(areOnDifferentHorizontalTiles([7, 5], [7, 9], GRID_SIZE)).toBe(
        false
      );
    });
    test("returns false if point1 and point2 are non-strictly on the same side of a vertical gridline", () => {
      expect(areOnDifferentHorizontalTiles([7, 10], [7, 15], GRID_SIZE)).toBe(
        false
      );
    });
  });
});

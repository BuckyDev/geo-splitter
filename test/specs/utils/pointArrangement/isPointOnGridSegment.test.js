const { describe, expect, test } = require("@jest/globals");
const {
  isPointOnGridSegment,
  isPointOnGridSegmentList,
} = require("../../../../src/utils/pointArrangement/isPointOnGridSegment");
const { GRID_SIZE } = require("../../../constants/grid");

describe("isPointOnGridSegment", () => {
  describe("isPointOnGridSegment", () => {
    test("should return true when point is on a horizontal grid segment", () => {
      expect(
        isPointOnGridSegment(
          [5, 10],
          [
            [0, 10],
            [10, 10],
          ],
          GRID_SIZE
        )
      ).toBe(true);
    });
    test("should return true when point is on a vertical grid segment", () => {
      expect(
        isPointOnGridSegment(
          [10, 5],
          [
            [10, 0],
            [10, 10],
          ],
          GRID_SIZE
        )
      ).toBe(true);
    });
    test("should return true when point is on a horizontal grid segment limit", () => {
      expect(
        isPointOnGridSegment(
          [0, 10],
          [
            [0, 10],
            [10, 10],
          ],
          GRID_SIZE
        )
      ).toBe(true);
    });
    test("should return true when point is on a vertical grid segment limit", () => {
      expect(
        isPointOnGridSegment(
          [10, 0],
          [
            [10, 0],
            [10, 10],
          ],
          GRID_SIZE
        )
      ).toBe(true);
    });
    test("should return false when point is not on a horizontal grid segment", () => {
      expect(
        isPointOnGridSegment(
          [0, 20],
          [
            [0, 10],
            [10, 10],
          ],
          GRID_SIZE
        )
      ).toBe(false);
      expect(
        isPointOnGridSegment(
          [12, 10],
          [
            [0, 10],
            [10, 10],
          ],
          GRID_SIZE
        )
      ).toBe(false);
    });
    test("should return false when point is not on a vertical grid segment", () => {
      expect(
        isPointOnGridSegment(
          [20, 0],
          [
            [10, 0],
            [10, 10],
          ],
          GRID_SIZE
        )
      ).toBe(false);
      expect(
        isPointOnGridSegment(
          [10, 12],
          [
            [10, 0],
            [10, 10],
          ],
          GRID_SIZE
        )
      ).toBe(false);
    });
    test("should return false when point is not a grid point", () => {
      expect(
        isPointOnGridSegment(
          [9, 12],
          [
            [10, 0],
            [10, 10],
          ],
          GRID_SIZE
        )
      ).toBe(false);
    });
  });

  describe("isPointOnGridSegmentList", () => {
    test("should return true when point is on any grid segment", () => {
      expect(
        isPointOnGridSegmentList(
          [5, 10],
          [
            [
              [0, 10],
              [10, 10],
            ],
            [
              [10, 10],
              [20, 10],
            ],
          ],
          GRID_SIZE
        )
      ).toBe(true);
    });
    test("should return false when point is not on any grid segment", () => {
      expect(
        isPointOnGridSegmentList(
          [25, 10],
          [
            [
              [0, 10],
              [10, 10],
            ],
            [
              [10, 10],
              [20, 10],
            ],
          ],
          GRID_SIZE
        )
      ).toBe(false);
    });
  });
});

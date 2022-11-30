const { describe, expect, test } = require("@jest/globals");
const {
  arePointsAligned,
} = require("../../../../src/utils/pointArrangement/arePointsAligned");

/**
 * Test vocabulary:
 * - "in order" means that point 2 is the point in the middle of points 1 & 3
 */

const VERTICALLY_ALIGNED_POINTS_SET = {
  POINT_1: [8, 10],
  POINT_2: [8, 12],
  POINT_3: [8, 16],
};

const DIAGONALLY_ALIGNED_POINTS_SET = {
  POINT_1: [8, 10],
  POINT_2: [9, 12],
  POINT_3: [11, 16],
};

const NOT_ALIGNED_POINTS_SET = {
  POINT_1: [8, 10],
  POINT_2: [9, 12],
  POINT_3: [13, 16],
};

describe("arePointsAligned", () => {
  test("returns true for vertically aligned points in order", () => {
    expect(
      arePointsAligned(
        VERTICALLY_ALIGNED_POINTS_SET.POINT_1,
        VERTICALLY_ALIGNED_POINTS_SET.POINT_2,
        VERTICALLY_ALIGNED_POINTS_SET.POINT_3
      )
    ).toBe(true);
  });
  test("returns true for vertically aligned points not in order", () => {
    expect(
      arePointsAligned(
        VERTICALLY_ALIGNED_POINTS_SET.POINT_2,
        VERTICALLY_ALIGNED_POINTS_SET.POINT_1,
        VERTICALLY_ALIGNED_POINTS_SET.POINT_3
      )
    ).toBe(true);
    expect(
      arePointsAligned(
        VERTICALLY_ALIGNED_POINTS_SET.POINT_1,
        VERTICALLY_ALIGNED_POINTS_SET.POINT_3,
        VERTICALLY_ALIGNED_POINTS_SET.POINT_2
      )
    ).toBe(true);
  });
  test("returns true for diagonally aligned points in order", () => {
    expect(
      arePointsAligned(
        DIAGONALLY_ALIGNED_POINTS_SET.POINT_1,
        DIAGONALLY_ALIGNED_POINTS_SET.POINT_2,
        DIAGONALLY_ALIGNED_POINTS_SET.POINT_3
      )
    ).toBe(true);
  });
  test("returns true for diagonally aligned points not in order", () => {
    expect(
      arePointsAligned(
        DIAGONALLY_ALIGNED_POINTS_SET.POINT_2,
        DIAGONALLY_ALIGNED_POINTS_SET.POINT_1,
        DIAGONALLY_ALIGNED_POINTS_SET.POINT_3
      )
    ).toBe(true);
    expect(
      arePointsAligned(
        DIAGONALLY_ALIGNED_POINTS_SET.POINT_1,
        DIAGONALLY_ALIGNED_POINTS_SET.POINT_3,
        DIAGONALLY_ALIGNED_POINTS_SET.POINT_2
      )
    ).toBe(true);
  });
  test("returns false for not aligned points", () => {
    expect(
      arePointsAligned(
        NOT_ALIGNED_POINTS_SET.POINT_1,
        NOT_ALIGNED_POINTS_SET.POINT_2,
        NOT_ALIGNED_POINTS_SET.POINT_3
      )
    ).toBe(false);
  });
});

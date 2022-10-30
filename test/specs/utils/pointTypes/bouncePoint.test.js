const { describe, expect, test } = require("@jest/globals");
const {
  isBouncePointByIdx,
} = require("../../../../src/utils/pointTypes/bouncePoint");
const { GRID_SIZE } = require("../../../constants/grid");

const VALID_BOUNCES_CONFIG = [
  // Horizontal grid point with surrounding points stricty on same side
  [
    [5, 5],
    [6, 10],
    [7, 5],
  ],
  // Vertical grid point with surrounding points stricty on same side
  [
    [5, 5],
    [10, 6],
    [7, 7],
  ],
  // Both vertical and horizontal grid point with surrounding points stricty on same side
  [
    [5, 5],
    [10, 10],
    [8, 7],
  ],
];

const INVALID_BOUNCES_CONFIG = [
  // Not a grid point
  [
    [5, 5],
    [5, 7],
    [8, 7],
  ],
  // Horizontal grid point with previous point being a grid point
  [
    [5, 10],
    [6, 10],
    [7, 12],
  ],
  // Horizontal grid point with next point being a grid point
  [
    [5, 7],
    [6, 10],
    [7, 10],
  ],
  // Vertical grid point with previous point being a grid point
  [
    [10, 5],
    [10, 6],
    [12, 7],
  ],
  // Vertical grid point with next point being a grid point
  [
    [5, 5],
    [10, 6],
    [10, 7],
  ],
  // Both vertical and horizontal grid point with previous point being a grid point
  [
    [5, 10],
    [10, 10],
    [12, 7],
  ],
  // Both vertical and horizontal grid point with next point being a grid point
  [
    [5, 5],
    [10, 10],
    [10, 7],
  ],
  // Horizontal grid point with surrounding points stricty on different sides
  [
    [5, 5],
    [6, 10],
    [7, 12],
  ],
  // Vertical grid point with surrounding points stricty on different sides
  [
    [5, 5],
    [10, 6],
    [12, 7],
  ],
  // Both vertical and horizontal grid point with surrounding points stricty on different sides
  [
    [5, 5],
    [10, 10],
    [12, 7],
  ],
];

describe("bouncePoint", () => {
  describe("isBouncePointByIdx", () => {
    function createTest(array, expectedResult) {
      return test(`returns ${expectedResult} for ${JSON.stringify(
        array
      )} with a gridSize of ${GRID_SIZE}`, () => {
        expect(isBouncePointByIdx(1, array, GRID_SIZE)).toBe(expectedResult);
      });
    }

    VALID_BOUNCES_CONFIG.map((validArray) => createTest(validArray, true));
    INVALID_BOUNCES_CONFIG.map((validArray) => createTest(validArray, false));
  });
});

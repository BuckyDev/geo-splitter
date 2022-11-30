const { describe, expect, test } = require("@jest/globals");
const {
  getNextPointByIdx,
  getPreviousPointByIdx,
} = require("../../../../src/utils/pointArrangement/getPointFromList");

const POINTS_SET = {
  POINT_1: [8, 10],
  POINT_2: [9, 12],
  POINT_3: [13, 16],
  POINT_4: [7, 12],
};

const UNIT_POINT_LIST = [POINTS_SET.POINT_1];
const DOUBLE_POINT_LIST = [POINTS_SET.POINT_1, POINTS_SET.POINT_2];
const FULL_POINT_LIST = Object.values(POINTS_SET);

describe("getPointFromList", () => {
  describe("getNextPointByIdx", () => {
    test("returns same point for unit list", () => {
      expect(getNextPointByIdx(0, UNIT_POINT_LIST)).toEqual(POINTS_SET.POINT_1);
    });
    test("returns next point for double list", () => {
      expect(getNextPointByIdx(0, DOUBLE_POINT_LIST)).toEqual(
        POINTS_SET.POINT_2
      );
      expect(getNextPointByIdx(1, DOUBLE_POINT_LIST)).toEqual(
        POINTS_SET.POINT_1
      );
    });
    test("returns next point for full list", () => {
      expect(getNextPointByIdx(1, FULL_POINT_LIST)).toEqual(POINTS_SET.POINT_3);
      expect(getNextPointByIdx(3, FULL_POINT_LIST)).toEqual(POINTS_SET.POINT_1);
    });
  });
  describe("getPreviousPointByIdx", () => {
    test("returns same point for unit list", () => {
      expect(getPreviousPointByIdx(0, UNIT_POINT_LIST)).toEqual(
        POINTS_SET.POINT_1
      );
    });
    test("returns previous point for double list", () => {
      expect(getPreviousPointByIdx(0, DOUBLE_POINT_LIST)).toEqual(
        POINTS_SET.POINT_2
      );
      expect(getPreviousPointByIdx(1, DOUBLE_POINT_LIST)).toEqual(
        POINTS_SET.POINT_1
      );
    });
    test("returns previous point for full list", () => {
      expect(getPreviousPointByIdx(0, FULL_POINT_LIST)).toEqual(
        POINTS_SET.POINT_4
      );
      expect(getPreviousPointByIdx(2, FULL_POINT_LIST)).toEqual(
        POINTS_SET.POINT_2
      );
    });
  });
});

const { describe, expect, test } = require("@jest/globals");
const {
  getTileGroup,
  createSphericGrid,
  isValidSphericGrid,
} = require("../../src/sphericSplit");
const { GRID_SIZE } = require("../constants/grid");

describe("sphericSplit", () => {
  describe("getTileGroup", () => {
    test("returns the correct group of tiles", () => {
      expect(
        getTileGroup({
          currentX: 0,
          currentTileWidth: 30,
          currentY: 10,
          gridSize: GRID_SIZE,
        })
      ).toEqual(["0_10", "10_10", "20_10"]);
    });
  });
  describe("isValidSphericGrid", () => {
    test("returns false if map dimensions and gridSize won't match", () => {
      expect(
        isValidSphericGrid({
          gridSize: GRID_SIZE,
          mapHeight: 165,
          mapWidth: 80,
          latRatio: 4,
        })
      ).toBe(false);
      expect(
        isValidSphericGrid({
          gridSize: GRID_SIZE,
          mapHeight: 160,
          mapWidth: 85,
          latRatio: 4,
        })
      ).toBe(false);
    });
    test("returns false if mapWidth/gridSize can't be reached with the provided latRatio", () => {
      expect(
        isValidSphericGrid({
          gridSize: GRID_SIZE,
          mapHeight: 160,
          mapWidth: 80,
          latRatio: 3,
        })
      ).toBe(false);
    });
    test("returns true if all conditions passed", () => {
      expect(
        isValidSphericGrid({
          gridSize: GRID_SIZE,
          mapHeight: 160,
          mapWidth: 80,
          latRatio: 4,
        })
      ).toBe(false);
    });
  });
  describe("createSphericGrid", () => {
    test("returns the correct tile groups", () => {
      const sphericGrid = createSphericGrid({
        gridSize: GRID_SIZE,
        xStart: 0,
        xEnd: 120,
        yStart: 0,
        yEnd: 40,
        latRatio: 4,
      });
      // TODO: wrong expectations
      expect(sphericGrid).toEqual([
        ["0_0", "10_0", "20_0"],
        ["30_0", "40_0", "50_0"],
        ["60_0", "70_0", "80_0"],
        ["90_0", "100_0", "110_0"],
        ["0_10", "10_10", "20_10"],
        ["30_10", "40_10", "50_10"],
        ["60_10", "70_10", "80_10"],
        ["90_10", "100_10", "110_10"],
        ["0_20", "10_20", "20_20"],
        ["30_20", "40_20", "50_20"],
        ["60_20", "70_20", "80_20"],
        ["90_20", "100_20", "110_20"],
        ["0_30", "10_30", "20_30"],
        ["30_30", "40_30", "50_30"],
        ["60_30", "70_30", "80_30"],
        ["90_30", "100_30", "110_30"],
      ]);
    });
    test("returns the correct tile groups", () => {
      const sphericGrid = createSphericGrid({
        gridSize: GRID_SIZE,
        xStart: -60,
        xEnd: 60,
        yStart: -20,
        yEnd: 20,
        latRatio: 4,
      });
      console.log(sphericGrid);
      // TODO: wrong expectations
      expect(sphericGrid).toEqual([
        ["-60_-20", "-50_-20", "-40_-20"],
        ["-30_-20", "-20_-20", "-10_-20"],
        ["0_-20", "10_-20", "20_-20"],
        ["30_-20", "40_-20", "50_-20"],
        ["-60_-10", "-50_-10", "-40_-10"],
        ["-30_-10", "-20_-10", "-10_-10"],
        ["0_-10", "10_-10", "20_-10"],
        ["30_-10", "40_-10", "50_-10"],
        ["-60_0", "-50_0", "-40_0"],
        ["-30_0", "-20_0", "-10_0"],
        ["0_0", "10_0", "20_0"],
        ["30_0", "40_0", "50_0"],
        ["-60_10", "-50_10", "-40_10"],
        ["-30_10", "-20_10", "-10_10"],
        ["0_10", "10_10", "20_10"],
        ["30_10", "40_10", "50_10"],
      ]);
    });
  });
});

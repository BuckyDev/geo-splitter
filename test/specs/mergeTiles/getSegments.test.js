const { describe, expect, test } = require("@jest/globals");
const {
  getAllSegments,
  getStartPoint,
} = require("../../../src/mergeTiles/getSegments");
const {
  polygonsBenchTest,
} = require("../../constants/benchTest/polygonsBenchTest");
const { GRID_SIZE } = require("../../constants/grid");
const {
  toMatchExpectedSegments,
} = require("../../matchers/toMatchExpectedSegments");

const testedPolygonIds = [
  "0",
  //"2", // TODO: this polygon has a mismatch point and data must be preprocessed to add that mute point back
  //"3",
  //"4",
  //"5",
  "6", // General case of mismatch point
  //"7",
  //"8",
  //"9",
  //"10",
  //"11",
  //"12",
];

expect.extend({
  toMatchExpectedSegments,
});

describe("getSegments", () => {
  describe("getStartPoint", () => {
    test("returns the right start point", () => {
      const coordArray = [
        [40, 10],
        [46, 10],
        [44, 8],
        [40, 6],
      ];
      expect(getStartPoint(coordArray, [], GRID_SIZE)).toEqual(1);
    });
  });
  describe("getAllSegments bench tests", () => {
    function createTest(polygonId) {
      return test(`returns correct segments for polygon ${polygonId} with a gridSize of ${GRID_SIZE}`, () => {
        // Build segments
        const polygonTestData = polygonsBenchTest.find(
          ({ id }) => id === polygonId
        );
        const segments = getAllSegments(
          polygonTestData.coordList,
          polygonTestData.innerPoints,
          GRID_SIZE
        );

        /**
         * Check segments are correct:
         * - should have same number of segments
         * - each actual segment or reversed version of that segment should be included in expectedSegments
         */
        const expectedSegments = polygonTestData.segments;
        expect(segments).toMatchExpectedSegments(expectedSegments);
      });
    }

    testedPolygonIds.map((polygonId) => createTest(`${polygonId}`));
  });
});

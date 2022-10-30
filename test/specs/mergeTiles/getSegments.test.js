const { describe, expect, test } = require("@jest/globals");
const { getAllSegments } = require("../../../src/mergeTiles/getSegments");
const {
  polygonsBenchTest,
} = require("../../constants/benchTest/polygonsBenchTest");
const { GRID_SIZE } = require("../../constants/grid");
const {
  toMatchExpectedSegments,
} = require("../../matchers/toMatchExpectedSegments");

const testedPolygonIds = [
  "0",
  //"2",
  //"3",
  //"4",
  //"5",
  //"6",
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

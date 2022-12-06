const { crossPointNb, getPolygonOuterPoint } = require("../utils/pointUtils");
const { C, RUN_STATE } = require("../process/consoleManager");
const { genArray, includeArr, flattenDoubleArray } = require("../utils/utils");

/**
 * @param {*} testPoint
 * @param {*} feature
 * @returns boolean
 *
 * Computes whether the grid point on gridlines intersection is within the polygon
 */
function isPointInside(testPoint, feature) {
  const featurePoints = feature.geometry.coordinates;
  return featurePoints
    .map((polygonPoints) => {
      //Only one ref should be enough but two is more reliable (longitude splitting)
      const leftRef = getPolygonOuterPoint(testPoint, polygonPoints, "left");
      const isInLeft =
        crossPointNb(testPoint, leftRef, polygonPoints) % 2 === 1;
      if (!isInLeft) {
        return false;
      }

      const bottomRef = getPolygonOuterPoint(
        testPoint,
        polygonPoints,
        "bottom"
      );
      const isInBottom =
        crossPointNb(testPoint, bottomRef, polygonPoints) % 2 === 1;
      if (!isInBottom) {
        return false;
      }

      return true;
    })
    .includes(true);
}

/**
 * @param {*} data
 * @param {*} xStart
 * @param {*} xEnd
 * @param {*} yStart
 * @param {*} yEnd
 * @param {*} gridSize
 * @returns array of corner point arrays
 *
 * Computes the corner points for the whole FeatureCollection
 */
function generateCornerPoints(data, xStart, xEnd, yStart, yEnd, gridSize) {
  const pointsToTest = [];
  genArray(xStart, xEnd, gridSize).map((x) => {
    genArray(yStart, yEnd, gridSize).map((y) => {
      pointsToTest.push([x, y]);
    });
  });

  C.cornerPoints = RUN_STATE.RUNNING;
  return data.features.map((feature, idx) => {
    const featurePoints = flattenDoubleArray(feature.geometry.coordinates);
    const result = pointsToTest.filter(
      (point) =>
        isPointInside(point, feature) && !includeArr(featurePoints, point)
    );
    C.updateRun(idx, data.features.length);
    return result;
  });
}

module.exports = {
  isPointInside,
  generateCornerPoints,
};

// TODO: Test all

const { genArray } = require("../utils/utils");
const {
  getGridCoordBoundary,
} = require("../utils/polygonArrangement/getCoordBoundary");

/**
 * @param {*} coordList
 * @param {number} gridSize
 * @returns segment list
 * Returns an array of grid segments that can contains border between different split of a polygon
 */
function getGridSegmentList(coordList, gridSize) {
  const { xMin, xMax, yMin, yMax } = getGridCoordBoundary(coordList, gridSize);

  const xCoords = genArray(xMin, xMax, gridSize);
  const yCoords = genArray(yMin, yMax, gridSize);

  const verticalGridSegments =
    xCoords.length > 2
      ? xCoords
          .slice(1, -1)
          .map((x) =>
            yCoords.slice(0, -1).map((y, yIdx) => [
              [x, y],
              [x, yCoords[yIdx + 1]],
            ])
          )
          .flat()
      : [];

  const horizontalGridSegments =
    yCoords.length > 2
      ? yCoords
          .slice(1, -1)
          .map((y) =>
            xCoords.slice(0, -1).map((x, xIdx) => [
              [x, y],
              [xCoords[xIdx + 1], y],
            ])
          )
          .flat()
      : [];

  return verticalGridSegments.concat(horizontalGridSegments);
}

/**
 * @param {*} coordList
 * @param {number} gridSize
 * @returns segment list
 * Returns an array of grid segments that are the boundary of the merge zone
 */
function getBoundaryGridSegmentList(coordList, gridSize) {
  const { xMin, xMax, yMin, yMax } = getGridCoordBoundary(coordList, gridSize);

  const xCoords = genArray(xMin, xMax, gridSize);
  const yCoords = genArray(yMin, yMax, gridSize);

  const verticalGridSegments = [xCoords[0], xCoords[xCoords.length - 1]]
    .map((x) =>
      yCoords.slice(0, -1).map((y, yIdx) => [
        [x, y],
        [x, yCoords[yIdx + 1]],
      ])
    )
    .flat();

  const horizontalGridSegments = [yCoords[0], yCoords[yCoords.length - 1]]
    .map((y) =>
      xCoords.slice(0, -1).map((x, xIdx) => [
        [x, y],
        [xCoords[xIdx + 1], y],
      ])
    )
    .flat();

  return verticalGridSegments.concat(horizontalGridSegments);
}

module.exports = {
  getGridSegmentList,
  getBoundaryGridSegmentList,
};

const { isGridPoint } = require("../pointTypes/gridPoint");

/**
 * @param {*} point
 * @param {*} gridSegment
 * @param {*} gridSize
 * @returns boolean
 * Returns whether the point is located on the grid segment
 */
function isPointOnGridSegment(point, gridSegment, gridSize) {
  if (!isGridPoint(point, gridSize)) {
    return false;
  }

  // If the grid segment is vertical
  if (gridSegment[0][0] === gridSegment[1][0]) {
    return (
      point[0] === gridSegment[0][0] &&
      point[1] <= Math.max(gridSegment[0][1], gridSegment[1][1]) &&
      point[1] >= Math.min(gridSegment[0][1], gridSegment[1][1])
    );
  }

  // If the grid segment is horizontal
  return (
    point[1] === gridSegment[0][1] &&
    point[0] <= Math.max(gridSegment[0][0], gridSegment[1][0]) &&
    point[0] >= Math.min(gridSegment[0][0], gridSegment[1][0])
  );
}

module.exports = {
  isPointOnGridSegment,
};

/**
 * @param {point} refPoint
 * @param {point array} pointList
 * @returns boolean
 * Returns whether all the points in point list have different x coordinates than the ref point
 */
function haveDifferentXCoord(refPoint, pointList) {
  return pointList.every((point) => point[0] !== refPoint[0]);
}

/**
 * @param {point} refPoint
 * @param {point array} pointList
 * @returns boolean
 * Returns whether all the points in point list have different y coordinates than the ref point
 */
function haveDifferentYCoord(refPoint, pointList) {
  return pointList.every((point) => point[1] !== refPoint[1]);
}

/**
 * @param {point} point1
 * @param {point} point2
 * @param {number} gridSize
 * @returns boolean
 * Returns whether points are (not strictly) on different sides of a vertical grid line
 */
function areOnDifferentVerticalTiles(point1, point2, gridSize) {
  return Math.floor(point1[0] / gridSize) !== Math.floor(point2[0] / gridSize);
}

/**
 * @param {point} point1
 * @param {point} point2
 * @param {number} gridSize
 * @returns boolean
 * Returns whether points are (not strictly) on different sides of a horizontal grid line
 */
function areOnDifferentHorizontalTiles(point1, point2, gridSize) {
  return Math.floor(point1[1] / gridSize) !== Math.floor(point2[1] / gridSize);
}

module.exports = {
  haveDifferentXCoord,
  haveDifferentYCoord,
  areOnDifferentVerticalTiles,
  areOnDifferentHorizontalTiles,
};

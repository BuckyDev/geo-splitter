const { GRID_POINT_TYPES } = require("../../constants/gridPointTypes");
const {
  haveDifferentXCoord,
  haveDifferentYCoord,
  areOnDifferentVerticalTiles,
  areOnDifferentHorizontalTiles,
} = require("../pointArrangement/comparePoints");
const {
  getPreviousPointByIdx,
  getNextPointByIdx,
} = require("../pointArrangement/getPointFromList");
const { getGridPointType } = require("./gridPoint");

/**
 * TESTED
 * @param {*} idx
 * @param {*} pointList
 * @param {*} gridSize
 * @returns boolean
 * Returns whether the point pointList[idx] is an interface point (see interface point definition in README)
 * WARNING: This util is meant to run on assembled polygons, it would not work on a split polygon to know which point to assemble for
 */
function isInterfacePointByIdx(idx, pointList, gridSize) {
  const gridPointType = getGridPointType(pointList[idx], gridSize);
  if (gridPointType === GRID_POINT_TYPES.NONE) {
    return false;
  }

  const currentPoint = pointList[idx];
  const previousPoint = getPreviousPointByIdx(idx, pointList);
  const nextPoint = getNextPointByIdx(idx, pointList);

  // Checks if the coordinates are on different sides of the gridline depending on the gridPointType
  switch (gridPointType) {
    case GRID_POINT_TYPES.VERTICAL:
      return (
        haveDifferentXCoord(currentPoint, [previousPoint, nextPoint]) &&
        areOnDifferentVerticalTiles(previousPoint, nextPoint, gridSize)
      );
    case GRID_POINT_TYPES.HORIZONTAL:
      return (
        haveDifferentYCoord(currentPoint, [previousPoint, nextPoint]) &&
        areOnDifferentHorizontalTiles(previousPoint, nextPoint, gridSize)
      );
    case GRID_POINT_TYPES.BOTH:
      return (
        (haveDifferentXCoord(currentPoint, [previousPoint, nextPoint]) &&
          areOnDifferentVerticalTiles(previousPoint, nextPoint, gridSize)) ||
        (haveDifferentYCoord(currentPoint, [previousPoint, nextPoint]) &&
          areOnDifferentHorizontalTiles(previousPoint, nextPoint, gridSize))
      );
    default:
      return false;
  }
}

module.exports = {
  isInterfacePointByIdx,
};

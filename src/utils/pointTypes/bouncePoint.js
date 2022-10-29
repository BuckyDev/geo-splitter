const { GRID_POINT_TYPES } = require("../../constants/gridPointTypes");
const {
  getPreviousPointByIdx,
  getNextPointByIdx,
} = require("../pointArrangement/getPointFromList");
const {
  haveDifferentXCoord,
  haveDifferentYCoord,
  areOnDifferentVerticalTiles,
  areOnDifferentHorizontalTiles,
} = require("../pointArrangement/comparePoints");
const { getGridPointType } = require("./gridPoint");

/**
 * @param {*} idx
 * @param {*} pointList
 * @param {*} gridSize
 * @returns boolean
 * Returns whether the point pointList[idx] is a bounce point (see bounce point definition in README)
 */
function isBouncePointByIdx(idx, pointList, gridSize) {
  const gridPointType = getGridPointType(pointList[idx], gridSize);
  if (gridPointType === GRID_POINT_TYPES.NONE) {
    return false;
  }

  const currentPoint = pointList[idx];
  const previousPoint = getPreviousPointByIdx(idx, pointList);
  const nextPoint = getNextPointByIdx(idx, pointList);

  // Checks if the coordinates are on same sides of the gridline depending on the gridPointType
  switch (gridPointType) {
    case GRID_POINT_TYPES.VERTICAL:
      return (
        haveDifferentXCoord(currentPoint, [previousPoint, nextPoint]) &&
        !areOnDifferentVerticalTiles(previousPoint, nextPoint, gridSize)
      );
    case GRID_POINT_TYPES.HORIZONTAL:
      return (
        haveDifferentYCoord(currentPoint, [previousPoint, nextPoint]) &&
        !areOnDifferentHorizontalTiles(previousPoint, nextPoint, gridSize)
      );
    case GRID_POINT_TYPES.BOTH:
      return (
        haveDifferentXCoord(currentPoint, [previousPoint, nextPoint]) &&
        haveDifferentYCoord(currentPoint, [previousPoint, nextPoint]) &&
        !areOnDifferentVerticalTiles(previousPoint, nextPoint, gridSize) &&
        !areOnDifferentHorizontalTiles(previousPoint, nextPoint, gridSize)
      );
    default:
      return false;
  }
}

module.exports = {
  isBouncePointByIdx,
};

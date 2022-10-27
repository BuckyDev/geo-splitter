const { GRID_POINT_TYPES } = require("../../constants/gridPointTypes");
const {
  getPreviousPointByIdx,
  getNextPointByIdx,
} = require("../pointArrangement/getPointFromList");
const { getGridPointType } = require("./gridPoint");

/**
 * @param {*} idx
 * @param {*} pointList
 * @param {*} gridSize
 * @returns boolean
 * Returns whether the point pointList[idx] is an interface point (see interface point definition in README)
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
        previousPoint[0] !== currentPoint[0] &&
        nextPoint[0] !== currentPoint[0] &&
        Math.floor(previousPoint[0] / gridSize) !==
          Math.floor(nextPoint[0] / gridSize)
      );
    case GRID_POINT_TYPES.HORIZONTAL:
      return (
        previousPoint[1] !== currentPoint[1] &&
        nextPoint[1] !== currentPoint[1] &&
        Math.floor(previousPoint[1] / gridSize) !==
          Math.floor(nextPoint[1] / gridSize)
      );
    case GRID_POINT_TYPES.BOTH:
      return (
        (previousPoint[0] !== currentPoint[0] &&
          previousPoint[1] !== currentPoint[1] &&
          nextPoint[0] !== currentPoint[0] &&
          nextPoint[1] !== currentPoint[1] &&
          Math.floor(previousPoint[0] / gridSize) !==
            Math.floor(nextPoint[0] / gridSize)) ||
        Math.floor(previousPoint[1] / gridSize) !==
          Math.floor(nextPoint[1] / gridSize)
      );
    default:
      return false;
  }
}

module.exports = {
  isInterfacePointByIdx,
};

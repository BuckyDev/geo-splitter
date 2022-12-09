const { GRID_POINT_TYPES } = require("../../constants/gridPointTypes");

/**
 * TESTED
 * @param {*} point
 * @param {*} gridSize
 * @returns boolean
 * Returns whether the point is a grid point (see grid point definition in README)
 */
function isGridPoint(point, gridSize) {
  return point[0] % gridSize === 0 || point[1] % gridSize === 0;
}

/**
 * TESTED
 * @param {*} point
 * @param {*} gridSize
 * @returns any of GRID_POINT_TYPES
 * Returns whether the type of grid point, depending one type of gridline(s) it is on
 */
function getGridPointType(point, gridSize) {
  const isPointOnVerticalGridLine = point[0] % gridSize === 0;
  const isPointOnHorizontalGridLine = point[1] % gridSize === 0;

  if (isPointOnVerticalGridLine && !isPointOnHorizontalGridLine) {
    return GRID_POINT_TYPES.VERTICAL;
  }

  if (!isPointOnVerticalGridLine && isPointOnHorizontalGridLine) {
    return GRID_POINT_TYPES.HORIZONTAL;
  }

  if (isPointOnVerticalGridLine && isPointOnHorizontalGridLine) {
    return GRID_POINT_TYPES.BOTH;
  }

  if (!isPointOnVerticalGridLine && !isPointOnHorizontalGridLine) {
    return GRID_POINT_TYPES.NONE;
  }
}

module.exports = {
  isGridPoint,
  getGridPointType,
};

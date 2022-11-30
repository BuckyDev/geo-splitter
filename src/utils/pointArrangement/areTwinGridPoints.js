const { GRID_POINT_TYPES } = require("../../constants/gridPointTypes");
const { getGridPointType } = require("../pointTypes/gridPoint");

/**
 *
 * @param {*} point1
 * @param {*} point2
 * @param {*} gridSize
 * @returns boolean
 * Returns true if the grid points share a gridline
 * TODO: Add tests
 */
function areTwinGridPoints(point1, point2, gridSize) {
  const gridPointType1 = getGridPointType(point1, gridSize);
  const gridPointType2 = getGridPointType(point2, gridSize);

  if (
    gridPointType1 === GRID_POINT_TYPES.NONE ||
    gridPointType2 === GRID_POINT_TYPES.NONE
  ) {
    return false;
  }

  if (
    gridPointType1 === GRID_POINT_TYPES.VERTICAL &&
    (gridPointType2 === GRID_POINT_TYPES.VERTICAL ||
      gridPointType2 === GRID_POINT_TYPES.BOTH)
  ) {
    return point1[0] === point2[0];
  }

  if (
    gridPointType1 === GRID_POINT_TYPES.HORIZONTAL &&
    (gridPointType2 === GRID_POINT_TYPES.HORIZONTAL ||
      gridPointType2 === GRID_POINT_TYPES.BOTH)
  ) {
    return point1[1] === point2[1];
  }

  if (gridPointType1 === GRID_POINT_TYPES.BOTH) {
    return point1[0] === point2[0] || point1[1] === point2[1];
  }
}

module.exports = {
  areTwinGridPoints,
};

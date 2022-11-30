const { arePointsAligned } = require("../pointArrangement/arePointsAligned");
const {
  getPreviousPointByIdx,
  getNextPointByIdx,
} = require("../pointArrangement/getPointFromList");
const { isInterfacePointByIdx } = require("./interfacePoint");

/**
 * @param {*} idx
 * @param {*} pointList
 * @param {*} gridSize
 * @returns boolean
 * Returns whether the point pointList[idx] is a split point (see split point definition in README)
 */
function isSplitPointByIdx(idx, pointList, gridSize) {
  if (!isInterfacePointByIdx(idx, pointList, gridSize)) {
    return false;
  }

  // Checks if the point is on the line prev-next
  const currentPoint = pointList[idx];
  const previousPoint = getPreviousPointByIdx(idx, pointList);
  const nextPoint = getNextPointByIdx(idx, pointList);
  return arePointsAligned(previousPoint, currentPoint, nextPoint);
}

module.exports = {
  isSplitPointByIdx,
};

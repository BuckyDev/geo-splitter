/**
 *
 * @param {*} idx
 * @param {*} pointList
 * @returns point
 * Returns the next point of the path given that the path is condired cyclic
 */
function getNextPointByIdx(idx, pointList) {
  return pointList[idx + 1 === pointList.length ? 0 : idx + 1];
}

/**
 *
 * @param {*} idx
 * @param {*} pointList
 * @returns point
 * Returns the previous point of the path given that the path is condired cyclic
 */
function getPreviousPointByIdx(idx, pointList) {
  return pointList[idx - 1 >= 0 ? idx - 1 : pointList.length - 1];
}
module.exports = {
  getNextPointByIdx,
  getPreviousPointByIdx,
};

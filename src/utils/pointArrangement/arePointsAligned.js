/**
 * TESTED
 * @param {*} point1
 * @param {*} point2
 * @param {*} point3
 * @returns boolean
 * Returns whether those three points are aligned
 */
function arePointsAligned(point1, point2, point3) {
  if (point3[0] === point1[0]) {
    return point2[0] === point1[0];
  }

  const largeSlope = (point3[1] - point1[1]) / (point3[0] - point1[0]);
  const smallSlope = (point2[1] - point1[1]) / (point2[0] - point1[0]);

  // We need to add some tolerance to consider results equal
  return Math.abs(largeSlope - smallSlope) < 0.02;
}

module.exports = {
  arePointsAligned,
};

const { arePointsEqual } = require("../../utils/utils");

/**
 * TESTED
 * @param {*} segment1
 * @param {*} segment2
 * Returns true if the segments, no matter their point arrangement are equals
 */
function areSegmentsEqual(segment1, segment2) {
  return (
    (arePointsEqual(segment1[0], segment2[0]) &&
      arePointsEqual(segment1[1], segment2[1])) ||
    (arePointsEqual(segment1[1], segment2[0]) &&
      arePointsEqual(segment1[0], segment2[1]))
  );
}

module.exports = {
  areSegmentsEqual,
};

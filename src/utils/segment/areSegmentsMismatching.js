const { arePointsEqual } = require("../../utils/utils");

/**
 * TESTED
 * @param {*} segment1
 * @param {*} segment2
 * Returns true if the segments have a mismatch (see Mismatch point definition in the README)
 * This util is meant to be used on segments that are on the same gridline
 */
function areSegmentsMismatching(segment1, segment2) {
  return (
    (arePointsEqual(segment1[0], segment2[0]) &&
      !arePointsEqual(segment1[1], segment2[1])) ||
    (arePointsEqual(segment1[1], segment2[1]) &&
      !arePointsEqual(segment1[0], segment2[0])) ||
    (arePointsEqual(segment1[0], segment2[1]) &&
      !arePointsEqual(segment1[1], segment2[0])) ||
    (arePointsEqual(segment1[1], segment2[0]) &&
      !arePointsEqual(segment1[0], segment2[1]))
  );
}

module.exports = {
  areSegmentsMismatching,
};

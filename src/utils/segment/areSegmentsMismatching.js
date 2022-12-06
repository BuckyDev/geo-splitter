const { arePointsEqual } = require("../../utils/utils");

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

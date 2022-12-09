const { arePointsEqual } = require("../../utils/utils");

/**
 * TESTED
 * @param {*} segment1
 * @param {*} segment2
 * Returns an extra segment that will solve for this mismatch while assembling the segments
 * This util is meant to be used on:
 * - Segments that are on the same gridline
 * - Segments that actually have a mismatch, verified by areSegmentsMismatching (see Mismatch point definition in the README)
 */
function getMismatchFixSegment(segment1, segment2) {
  const sharedPoint = segment1.find(
    (point) =>
      arePointsEqual(point, segment2[0]) || arePointsEqual(point, segment2[1])
  );
  const mismatchPoint1 = segment1.find(
    (point) => !arePointsEqual(point, sharedPoint)
  );
  const mismatchPoint2 = segment2.find(
    (point) => !arePointsEqual(point, sharedPoint)
  );

  return [mismatchPoint1, mismatchPoint2];
}

module.exports = {
  getMismatchFixSegment,
};

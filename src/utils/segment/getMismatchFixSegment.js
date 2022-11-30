const { arePointsEqual } = require("../../utils");

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

const { arePointsEqual, distance } = require("../../utils");

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

  const mismatchPoint1Distance = distance(sharedPoint, mismatchPoint1);
  const mismatchPoint2Distance = distance(sharedPoint, mismatchPoint2);

  if (mismatchPoint1Distance > mismatchPoint2Distance) {
    return [segment1[0], mismatchPoint2];
  }

  return [segment2[0], mismatchPoint1];
}

module.exports = {
  getMismatchFixSegment,
};

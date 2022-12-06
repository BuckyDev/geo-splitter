const { arePointsEqual, distance } = require("../../utils/utils");

function getMismatchFix(matcher1, matcher2) {
  const sharedPoint = matcher1.segment.find(
    (point) =>
      arePointsEqual(point, matcher2.segment[0]) ||
      arePointsEqual(point, matcher2.segment[1])
  );
  const mismatchPoint1 = matcher1.segment.find(
    (point) => !arePointsEqual(point, sharedPoint)
  );
  const mismatchPoint2 = matcher2.segment.find(
    (point) => !arePointsEqual(point, sharedPoint)
  );

  const mismatchPoint1Distance = distance(sharedPoint, mismatchPoint1);
  const mismatchPoint2Distance = distance(sharedPoint, mismatchPoint2);

  if (mismatchPoint1Distance > mismatchPoint2Distance) {
    return {
      newPath: [matcher1.segment[0], mismatchPoint2, matcher1.segment[1]],
      oldSegment: matcher1.segment,
      properties: matcher1.properties,
    };
  }

  return {
    newPath: [matcher2.segment[0], mismatchPoint1, matcher2.segment[1]],
    oldSegment: matcher2.segment,
    properties: matcher2.properties,
  };
}

module.exports = {
  getMismatchFix,
};

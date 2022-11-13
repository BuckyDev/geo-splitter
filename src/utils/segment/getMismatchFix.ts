const { arePointsEqual, distance } = require("../../utils");

type Matcher = {
  segment: Segment;
  properties: FeatureProperties;
};

// TODO: add tests
function getMismatchFix(matcher1: Matcher, matcher2: Matcher): Mismatch {
  const sharedPoint: Point = matcher1.segment.find(
    (point) =>
      arePointsEqual(point, matcher2.segment[0]) ||
      arePointsEqual(point, matcher2.segment[1])
  );
  const mismatchPoint1: Point = matcher1.segment.find(
    (point) => !arePointsEqual(point, sharedPoint)
  );
  const mismatchPoint2: Point = matcher2.segment.find(
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

const { arePointsEqual } = require("../utils");
const { isSplitPointByIdx } = require("../utils/pointTypes/splitPoint");

function concatSegmentByIdx({ resultArray, segments, idx, shouldInvert }) {
  const matchingSegment = [...segments[idx]];
  segments.splice(idx, 1);

  matchingSegment;
  if (shouldInvert) {
    matchingSegment.reverse();
  }
  return resultArray.concat(matchingSegment.slice(1));
}

/**
 * @param {*} originalSegments
 * Returns a new feature that is a built of all segments
 */
function assembleSegments(originalSegments, gridSize) {
  const segments = [...originalSegments];
  let result = segments[0];

  let lastPoint = result[result.length - 1];
  segments.splice(0, 1);

  while (segments.length) {
    let shouldInvert;

    // Find a segment that will match the last point
    const idx = segments.findIndex((segment) => {
      if (arePointsEqual(lastPoint, segment[0])) {
        return true;
      }
      if (arePointsEqual(lastPoint, segment[segment.length - 1])) {
        shouldInvert = true;
        return true;
      }
      return false;
    });

    // Add the segment
    result = concatSegmentByIdx({
      resultArray: result,
      segments,
      idx,
      shouldInvert,
    });

    // Redefine the last point
    lastPoint = result[result.length - 1];
  }
  const straightPath = result.slice(0, -1);
  const polygonPath = straightPath.filter(
    (_point, idx) => !isSplitPointByIdx(idx, straightPath, gridSize)
  );
  const finalPolygonPath = [...polygonPath, polygonPath[0]];

  return finalPolygonPath;
}

module.exports = assembleSegments;

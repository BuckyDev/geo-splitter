const {
  getMismatchFixSegment,
} = require("../utils/segment/getMismatchFixSegment");
const {
  areSegmentsMismatching,
} = require("../utils/segment/areSegmentsMismatching");

const { genArray } = require("../utils");
const {
  getNextPointByIdx,
} = require("../utils/pointArrangement/getPointFromList");
const {
  isPointOnGridSegment,
} = require("../utils/pointArrangement/isPointOnGridSegment");
const {
  getGridCoordBoundary,
} = require("../utils/polygonArrangement/getCoordBoundary");
const { areSegmentsEqual } = require("../utils/segment/areSegmentsEqual");

/**
 * @param {*} coordList
 * @param {number} gridSize
 * @returns segment list
 * Returns an array of grid segments that can contains border between different split of a polygon
 */
function getGridSegmentList(coordList, gridSize) {
  const { xMin, xMax, yMin, yMax } = getGridCoordBoundary(coordList, gridSize);

  const xCoords = genArray(xMin, xMax, gridSize);
  const yCoords = genArray(yMin, yMax, gridSize);

  const verticalGridSegments =
    xCoords.length > 2
      ? xCoords
          .slice(1, -1)
          .map((x) =>
            yCoords.slice(0, -1).map((y, yIdx) => [
              [x, y],
              [x, yCoords[yIdx + 1]],
            ])
          )
          .flat()
      : [];

  const horizontalGridSegments =
    yCoords.length > 2
      ? yCoords
          .slice(1, -1)
          .map((y) =>
            xCoords.slice(0, -1).map((x, xIdx) => [
              [x, y],
              [xCoords[xIdx + 1], y],
            ])
          )
          .flat()
      : [];

  return verticalGridSegments.concat(horizontalGridSegments);
}

/**
 * @param {*} coordArray
 * @param {*} gridSegment
 * @param {*} gridSize
 * Creates a list of path that are on the gridSegment
 */
function getBorderSegments(coordArray, gridSegment, gridSize) {
  const segments = [];

  // Extract segments
  coordArray.forEach((point, idx) => {
    if (!isPointOnGridSegment(point, gridSegment, gridSize)) {
      return;
    }
    const nextPoint = getNextPointByIdx(idx, coordArray);
    if (isPointOnGridSegment(nextPoint, gridSegment, gridSize)) {
      segments.push([point, nextPoint]);
    }
  });

  return segments;
}

/**
 * @param {*} gridSegmentList
 * @param {*} featureArray
 * @param {number} gridSize
 * @returns {Border}
 * Returns an array of borders between different split of a polygon
 */
function getBorderList(gridSegmentList, featureArray, gridSize) {
  return gridSegmentList
    .map((gridSegment) => {
      return {
        gridSegment,
        // TODO: speed up this process by early filtering features that don't have a border on the grid segment
        borders: featureArray
          .map((feature) => ({
            borderSegments: getBorderSegments(
              feature.geometry.coordinates[0].slice(0, -1),
              gridSegment,
              gridSize
            ),
            properties: feature.properties,
          }))
          .filter((border) => border.borderSegments.length > 0),
      };
    })
    .filter(({ borders }) => borders.length > 0);
}

/**
 * @param {*} border
 * @returns border mismatch
 * Returns a border mismatch details
 * Mismatches are borders from different polygons that have a shared point in different borders
 *
 */
function getSegments(border) {
  // Get the polygon idx with the highest number of border segments
  let refPolygonIdx;
  let maxBorderSegments = 0;
  border.borders.forEach(({ borderSegments }, idx) => {
    if (borderSegments.length > maxBorderSegments) {
      maxBorderSegments = borderSegments.length;
      refPolygonIdx = idx;
    }
  });
  const refPolygon = border.borders[refPolygonIdx];

  // Arrange the remaining border inputs for checking
  const borderPolygons = border.borders.filter(
    (_, idx) => idx !== refPolygonIdx
  );

  const mismatchingSegments = [];
  // Get the segments to add for segment mismatch
  const mismatchList = refPolygon.borderSegments
    .map((borderSegment) => {
      return borderPolygons
        .map((borderPolygon) =>
          borderPolygon.borderSegments.map((targetSegment) => {
            /* From here, we are checking if two different segments from the same border have a mismatch
               If yes, we return a mismatch fix (object that has information on how to inject the fix in the original data)
               If not, we filter that object
            */
            const hasMismatch = areSegmentsMismatching(
              borderSegment,
              targetSegment
            );
            if (!hasMismatch) {
              return undefined;
            }

            mismatchingSegments.push(borderSegment);
            mismatchingSegments.push(targetSegment);
            const segment = getMismatchFixSegment(borderSegment, targetSegment);

            return segment;
          })
        )
        .filter(Boolean)
        .flat();
    })
    .flat()
    .filter(Boolean);

  // TODO: Add extra tests on this logic
  // Get the extra segments for single border segment
  const matchingBorderSegments = border.borders
    .map(({ borderSegments }) => borderSegments)
    .flat()
    .filter(
      // Filter out segments that are in the mismatchingSegments
      (borderSegment) =>
        !mismatchingSegments.some((mismatchSegment) =>
          areSegmentsEqual(mismatchSegment, borderSegment)
        )
    );
  const singleBorderSegments = matchingBorderSegments.filter(
    // Filter out segments that are in double
    (borderSegment) =>
      matchingBorderSegments.filter((compareSegment) =>
        areSegmentsEqual(compareSegment, borderSegment)
      ).length < 2
  );

  return mismatchList.concat(singleBorderSegments);
}

/**
 * @param {*} borderList
 * @returns segmentList
 * Returns an array of segments to will be used
 * Mismatches are borders from different polygons that have a shared point in different borders
 *
 */
function getMismatchSegments(borderList) {
  return borderList
    .map((border) => {
      const mismatch = getSegments(border);
      return mismatch && mismatch.length ? mismatch : undefined;
    })
    .filter(Boolean)
    .flat();
}

/**
 * @param {*} featureList
 * @param {number} gridSize
 * @returns extraMismatchSegmentList
 * Returns a list of extra segments to resolve border mismatches
 */
function getBorderMismatchSegments(featureList, gridSize) {
  // Get gridlines to check for
  const coordList = featureList
    .map((feature) => feature.geometry.coordinates)
    .flat();
  const gridSegments = getGridSegmentList(coordList, gridSize);

  // Get border list to process
  const borderList = getBorderList(gridSegments, featureList, gridSize);

  // Get list of extra mismatch segments to inject
  return getMismatchSegments(borderList);
}

module.exports = {
  getBorderMismatchSegments,
};

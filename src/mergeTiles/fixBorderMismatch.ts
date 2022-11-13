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
const {
  areSegmentsMismatching,
} = require("../utils/segment/areSegmentsMismatching");

/**
 * @param {*} coordList
 * @param {number} gridSize
 * @returns segment list
 * Returns an array of grid segments that can contains border between different split of a polygon
 */
function getGridSegmentList(coordList: Path[], gridSize: number): Segment[] {
  const { xMin, xMax, yMin, yMax } = getGridCoordBoundary(coordList, gridSize);

  const xCoords: number[] = genArray(xMin, xMax, gridSize);
  const yCoords: number[] = genArray(yMin, yMax, gridSize);

  const verticalGridSegments =
    xCoords.length > 2
      ? xCoords
          .slice(1, -1)
          .map((x) =>
            yCoords.slice(0, -1).map(
              (y, yIdx) =>
                [
                  [x, y],
                  [x, yCoords[yIdx + 1]],
                ] as Segment
            )
          )
          .flat()
      : [];

  const horizontalGridSegments =
    yCoords.length > 2
      ? yCoords
          .slice(1, -1)
          .map((y) =>
            xCoords.slice(0, -1).map(
              (x, xIdx) =>
                [
                  [x, y],
                  [xCoords[xIdx + 1], y],
                ] as Segment
            )
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
function getBorderSegments(
  coordArray: Path,
  gridSegment: Segment,
  gridSize: number
): Segment[] {
  const segments: Segment[] = [];

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
function getBorderList(
  gridSegmentList: Segment[],
  featureArray: Feature[],
  gridSize: number
): Border[] {
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
function getMismatch(border: Border): Mismatch[] {
  // Get the polygon idx with the highest number of border segments
  let refPolygonIdx: number;
  let maxBorderSegments = 0;
  border.borders.forEach(({ borderSegments }, idx) => {
    if (borderSegments.length > maxBorderSegments) {
      maxBorderSegments = borderSegments.length;
      refPolygonIdx = idx;
    }
  });

  // Arrange the border inputs for checking
  const borderPolygons = border.borders.filter(
    (_, idx) => idx !== refPolygonIdx
  );
  const refPolygon = border.borders[refPolygonIdx];

  const mismatchList = refPolygon.borderSegments
    .map((borderSegment) => {
      return borderPolygons
        .map((borderPolygon) =>
          borderPolygon.borderSegments.map((targetSegment) => {
            const hasMismatch = areSegmentsMismatching(
              borderSegment,
              targetSegment
            );
            if (!hasMismatch) {
              return undefined;
            }
            const mismatch = getMismatchFix(
              { segment: borderSegment, properties: refPolygon.properties },
              { segment: targetSegment, properties: borderPolygon.properties }
            );

            return mismatch;
          })
        )
        .filter(Boolean)
        .flat();
    })
    .flat();

  return mismatchList;
}

/**
 * @param {*} borderList
 * @returns border mismatch list
 * Returns an array of borders that have a mismatch
 * Mismatches are borders from different polygons that have a shared point in different borders
 *
 */
function getBorderMismatch(borderList: Border[]): BorderMismatch[] {
  return borderList.map((border) => {
    return {
      ...border,
      mismatch: getMismatch(border),
    };
  });
}

/**
 * @param {*} featureArray
 * @param {number} gridSize
 * @returns featureArray
 * Returns an array of features meant to be merged with no more border mismatch
 */
function fixBorderMismatch(featureArray: Feature[], gridSize: number) {
  // Get gridlines to check for
  const coordList = featureArray
    .map((feature) => feature.geometry.coordinates)
    .flat();
  const gridSegments = getGridSegmentList(coordList, gridSize);

  // Get border list to process
  const borderList = getBorderList(gridSegments, featureArray, gridSize);

  // Get list of mismatching borders to process
  const mismatchList = getBorderMismatch(borderList);
}

module.exports = {
  fixBorderMismatch,
  getBorderList,
  getGridSegmentList,
  getBorderSegments,
};

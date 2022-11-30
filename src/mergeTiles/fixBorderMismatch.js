const { genArray, arePointsEqual } = require("../utils");
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
const { getMismatchFix } = require("../utils/segment/getMismatchFix");

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
function getMismatch(border) {
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
    .flat()
    .filter(Boolean);

  return mismatchList;
}

/**
 * @param {*} borderList
 * @returns border mismatch list
 * Returns an array of borders that have a mismatch
 * Mismatches are borders from different polygons that have a shared point in different borders
 *
 */
function getBorderMismatch(borderList) {
  return borderList
    .map((border) => {
      const mismatch = getMismatch(border);
      if (!mismatch || !mismatch.length) {
        return undefined;
      }
      return {
        ...border,
        mismatch,
      };
    })
    .filter(Boolean);
}

/**
 * @param {*} coordinates
 * @param {*} mismatch
 * @returns border mismatch list
 * Returns an updated version of a polygon coordinates after applying a single mismatch
 */
// TODO: Add tests
function injectMismatchOnCoordinates(coordinates, mismatch) {
  return coordinates.map((path) => {
    // Check if this path has the mismatch
    const firstPointIndex = path.findIndex((point) =>
      arePointsEqual(point, mismatch.oldSegment[0])
    );
    if (!firstPointIndex) {
      return path;
    }
    path.splice(firstPointIndex + 1, 0, mismatch.newPath[1]);
    return path;
  });
}

/**
 * @param {*} featureArray
 * @param {*} mismatchList
 * @returns border mismatch list
 * Returns an updated version of featureArray with all mismatch fixes applied
 */
// TODO: Add tests
function applyBorderMismatch(featureArray, mismatchList) {
  const featureArrayCopy = [...featureArray];

  mismatchList.forEach((borderMismatch) => {
    borderMismatch.mismatch.forEach((mismatch) => {
      // Get the feature concerned by the mismatch
      const mismatchingFeatureIdx = featureArrayCopy.findIndex(
        (feature) =>
          JSON.stringify(feature.properties) ===
          JSON.stringify(mismatch.properties)
      );
      let mismatchingFeature = featureArrayCopy[mismatchingFeatureIdx];

      // Inject the mismatch fix
      mismatchingFeature = {
        ...mismatchingFeature,
        geometry: {
          ...mismatchingFeature.geometry,
          coordinates: injectMismatchOnCoordinates(
            mismatchingFeature.geometry.coordinates,
            mismatch
          ),
        },
      };

      // Replace the feature with the updated version with mismatch applied
      featureArrayCopy.splice(mismatchingFeatureIdx, 1, mismatchingFeature);
    });
  });

  return featureArrayCopy;
}

/**
 * @param {*} featureArray
 * @param {number} gridSize
 * @returns featureArray
 * Returns an array of features meant to be merged with no more border mismatch
 */
function fixBorderMismatch(featureArray, gridSize) {
  // Get gridlines to check for
  const coordList = featureArray
    .map((feature) => feature.geometry.coordinates)
    .flat();
  const gridSegments = getGridSegmentList(coordList, gridSize);

  // Get border list to process
  const borderList = getBorderList(gridSegments, featureArray, gridSize);

  // Get list of mismatching borders to process
  const mismatchList = getBorderMismatch(borderList);

  // Apply the mismatch fixes into the original data and return it
  return applyBorderMismatch(featureArray, mismatchList);
}

module.exports = {
  fixBorderMismatch,
  getBorderList,
  getGridSegmentList,
  getBorderSegments,
  getBorderMismatch,
};

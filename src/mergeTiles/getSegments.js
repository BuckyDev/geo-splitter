const { GRID_POINT_TYPES } = require("../constants/gridPointTypes");
const {
  rotateArray,
  isPointInList,
  doesSegmentCoverTile,
} = require("../utils/utils");
const {
  areTwinGridPoints,
} = require("../utils/pointArrangement/areTwinGridPoints");
const {
  getNextPointByIdx,
} = require("../utils/pointArrangement/getPointFromList");
const {
  isPointOnGridSegmentList,
} = require("../utils/pointArrangement/isPointOnGridSegment");
const { isBouncePointByIdx } = require("../utils/pointTypes/bouncePoint");

const {
  getGridPointType,
  isGridPoint,
} = require("../utils/pointTypes/gridPoint");
const { areSegmentsEqual } = require("../utils/segment/areSegmentsEqual");

/**
 * 
 * @param {*} coordArray 
 * @param {*} innerPoints 
 * @param {*} gridSize 
 * @returns index
 * Returns the index of the first found grid point that:
    - isn't immediately followed by another grid point of the same grid point type
    - isn't immediately followed by an inner point
    Otherwise it means that this segment is a split border that shouldn't be included in the segment list
 */
function getStartPoint(coordArray, innerPoints, gridSegmentsList, gridSize) {
  const resultIndex = coordArray.findIndex((point, idx) => {
    // Checks that point is a grid point, and not inner point
    const isValidGridPoint =
      isGridPoint(point, gridSize) &&
      isPointOnGridSegmentList(point, gridSegmentsList, gridSize) &&
      !isPointInList(point, innerPoints);
    if (!isValidGridPoint) {
      return false;
    }

    // Checks that next point is not inner point and either not a grid point or a different type of grid point
    const nextPoint = getNextPointByIdx(idx, coordArray);
    const nextPointGridType = getGridPointType(nextPoint, gridSize);

    const isValidNextPoint =
      (nextPointGridType === GRID_POINT_TYPES.NONE ||
        !areTwinGridPoints(point, nextPoint, gridSize) ||
        // Or a point on an edge grid line
        !isPointOnGridSegmentList(nextPoint, gridSegmentsList, gridSize)) && // TODO: Test this
      !isPointInList(nextPoint, innerPoints);

    return isValidNextPoint;
  });

  if (resultIndex === undefined || resultIndex === -1) {
    // This case is hit when no point in the polygon is a grid point on internal border segment
    return 0;
  }

  return resultIndex;
}

/**
 *
 * @param {*}
 *  TODO: Test this
 */
function shouldAddPointAndKeepSegmentOpen({
  point,
  idx,
  gridSize,
  rotatedArray,
  gridSegmentsList,
  boundaryGridSegmentsList,
  innerPoints,
}) {
  // If point is not a grid point, keep it
  if (!isGridPoint(point, gridSize)) {
    return true;
  }

  // If point is an inner point, ignore it
  if (isPointInList(point, innerPoints)) {
    return false;
  }

  // ----- From here, we only have grid points that are not inner points

  // If point is a bounce point, keep it
  if (isBouncePointByIdx(idx, rotatedArray, gridSize)) {
    return true;
  }

  const isBoundaryGridPoint = isPointOnGridSegmentList(
    point,
    boundaryGridSegmentsList,
    gridSize
  );
  const isBorderGridPoint = isPointOnGridSegmentList(
    point,
    gridSegmentsList,
    gridSize
  );

  // If point is on an internal border grid line only, keep it
  if (!isBorderGridPoint && isBoundaryGridPoint) {
    return true;
  }

  // TODO: Check this
  // If point is on both border, leave the segment open if next point is not a border
  if (isBorderGridPoint && isBoundaryGridPoint) {
    const nextPoint = getNextPointByIdx(idx, rotatedArray);
    const isBorderGridNextPoint = isPointOnGridSegmentList(
      nextPoint,
      gridSegmentsList,
      gridSize
    );

    // TODO: maybe there's an edge case here
    return !isBorderGridNextPoint;
  }

  // Return false (shouldn't be reachable)
  return false;
}

/**
 * @param {*} coordArray
 * @param {*} innerPoints
 * @param {*} gridSegmentsList
 * @param {*} boundaryGridSegmentsList
 * @param {*} gridSize
 * Creates a list of path that connect split points, eliminating inner points.
 * Those segments should not connect split points that are immediately one after the other (those are borders).
 */
function getSegments(
  coordArray,
  innerPoints,
  gridSegmentsList,
  boundaryGridSegmentsList,
  gridSize
) {
  const segments = [];

  // Make the array start with the first valid point
  const firstSplitPointIndex = getStartPoint(
    coordArray,
    innerPoints,
    gridSegmentsList,
    gridSize
  );
  const rotatedArray = rotateArray(coordArray, firstSplitPointIndex);
  console.log({
    coordArray,
    innerPoints,
    gridSegmentsList,
    rotatedArray,
  });
  // Extract segments
  let hasOpenedSegment = false;
  rotatedArray.forEach((point, idx) => {
    // Open a new segment
    if (
      !hasOpenedSegment &&
      isGridPoint(point, gridSize) &&
      !isPointInList(point, innerPoints)
    ) {
      hasOpenedSegment = true;
      segments.push([point]);
    }

    // Add point to the last existing segment
    else if (
      hasOpenedSegment &&
      shouldAddPointAndKeepSegmentOpen({
        point,
        idx,
        gridSize,
        rotatedArray,
        gridSegmentsList,
        boundaryGridSegmentsList,
        innerPoints,
      })
    ) {
      segments[segments.length - 1].push(point);
    }

    // Close the segment
    else if (
      hasOpenedSegment &&
      isGridPoint(point, gridSize) &&
      !isBouncePointByIdx(idx, rotatedArray, gridSize) &&
      !isPointInList(point, innerPoints)
    ) {
      segments[segments.length - 1].push(point);
      hasOpenedSegment = false;
    }
  });

  return segments.filter((segment) => segment.length > 1);
}

/**
 * @param {*} coordArray
 * @param {*} innerPoints
 * @param {*} gridSegmentsList
 * @param {*} boundaryGridSegmentsList
 * @param {*} gridSize
 * Creates a list of path that connect split points, eliminating inner points.
 * Those segments should not connect split points that are immediately one after the other (those are borders).
 */
function getSegmentsforCoveringTiles(
  coordArray,
  boundaryGridSegmentsList,
  gridSize
) {
  // Return empty segments if no point is on boundary grid segments
  const hasPointOnBoundary = coordArray.some((point) =>
    isPointOnGridSegmentList(point, boundaryGridSegmentsList, gridSize)
  );
  if (!hasPointOnBoundary) {
    return [];
  }

  return boundaryGridSegmentsList.filter((boundaryGridSegment) =>
    coordArray.some((point, idx) =>
      areSegmentsEqual(
        [point, getNextPointByIdx(idx, coordArray)],
        boundaryGridSegment
      )
    )
  );
}

/**
 * @param {*} coordList an array of coord array, i.e an array of all the polygons to merge together
 * @param {*} innerPoints
 * @param {*} gridSegmentsList
 * @param {*} boundaryGridSegmentsList
 * @param {*} gridSize
 * Creates a list of path that connect split points, eliminating inner points.
 * Those segments should not connect split points that are immediately one after the other (those are borders).
 */
function getAllSegments(
  coordList,
  innerPoints,
  gridSegmentsList,
  boundaryGridSegmentsList,
  gridSize
) {
  // Removes any inner tile, i.e segments which describe a polygon that cover the whole tile
  const segmentsCoveringTile = [];
  const sanitizedCoordList = coordList.filter((coordArray) => {
    // Keep the tile if the polygon does not cover the tile
    if (!doesSegmentCoverTile(coordArray, gridSize)) {
      return true;
    }
    const hasNonInnerPoint = coordArray.some(
      (point) => !isPointInList(point, innerPoints)
    ); // TODO: Test this
    if (hasNonInnerPoint) {
      segmentsCoveringTile.push(coordArray);
    }
    // Keep the tile if any point is not an inner point
    return false;
  });

  // Get segments for coordArray that cover the tile
  const coveringTileSegments = segmentsCoveringTile
    .map((coordArray) =>
      getSegmentsforCoveringTiles(
        coordArray,
        boundaryGridSegmentsList,
        gridSize
      )
    )
    .flat();

  // Get segments for the sanitized coord list
  const mainTileSegments = sanitizedCoordList
    .map((coordArray) =>
      getSegments(
        coordArray,
        innerPoints,
        gridSegmentsList,
        boundaryGridSegmentsList,
        gridSize
      )
    )
    .flat();

  return [...coveringTileSegments, ...mainTileSegments];
}

module.exports = { getAllSegments, getStartPoint };

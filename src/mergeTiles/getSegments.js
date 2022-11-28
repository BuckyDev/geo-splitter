const { GRID_POINT_TYPES } = require("../constants/gridPointTypes");
const {
  rotateArray,
  isPointInList,
  doesSegmentCoverTile,
} = require("../utils");
const {
  areTwinGridPoints,
} = require("../utils/pointArrangement/areTwinGridPoints");
const {
  getNextPointByIdx,
} = require("../utils/pointArrangement/getPointFromList");
const {
  isPointOnGridSegment,
  isPointOnGridSegmentList,
} = require("../utils/pointArrangement/isPointOnGridSegment");
const { isBouncePointByIdx } = require("../utils/pointTypes/bouncePoint");

const {
  getGridPointType,
  isGridPoint,
} = require("../utils/pointTypes/gridPoint");

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
      isGridPoint(point, gridSize) && !isPointInList(point, innerPoints);
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
        !gridSegmentsList.some((gridSegment) =>
          isPointOnGridSegment(nextPoint, gridSegment, gridSize)
        )) && // TODO: Test this
      !isPointInList(nextPoint, innerPoints);

    return isValidNextPoint;
  });

  if (resultIndex === undefined || resultIndex === -1) {
    throw new Error(
      `getStartPoint: could not find a valid start point for coordArray ${JSON.stringify(
        coordArray
      )}`
    );
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
    const isBoundaryGridNextPoint = isPointOnGridSegmentList(
      nextPoint,
      boundaryGridSegmentsList,
      gridSize
    );
    const isBorderGridNextPoint = isPointOnGridSegmentList(
      nextPoint,
      gridSegmentsList,
      gridSize
    );
    return !isBorderGridNextPoint || isBoundaryGridNextPoint;
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
        gridSize,
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
  const sanitizedCoordList = coordList.filter((coordArray) => {
    // Keep the tile if the polygon does not cover the tile
    if (!doesSegmentCoverTile(coordArray, gridSize)) {
      return true;
    }
    // Keep the tile if any point is not an inner point
    return coordArray.some((point) => !isPointInList(point, innerPoints)); // TODO: Test this
  });

  return sanitizedCoordList
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
}

module.exports = { getAllSegments, getStartPoint };

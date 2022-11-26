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
function getStartPoint(coordArray, innerPoints, gridSize) {
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
        !areTwinGridPoints(point, nextPoint, gridSize)) &&
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
 * @param {*} coordArray
 * @param {*} innerPoints
 * @param {*} gridSize
 * Creates a list of path that connect split points, eliminating inner points.
 * Those segments should not connect split points that are immediately one after the other (those are borders).
 */
function getSegments(coordArray, innerPoints, gridSize) {
  const segments = [];

  // Make the array start with the first valid point
  const firstSplitPointIndex = getStartPoint(coordArray, innerPoints, gridSize);
  const rotatedArray = rotateArray(coordArray, firstSplitPointIndex);

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
      // Should not be a grid point because we should close the segment
      (!isGridPoint(point, gridSize) ||
        // Unless it is a bounce point
        isBouncePointByIdx(idx, rotatedArray, gridSize)) &&
      // Or next point is also a grid point on the same gridline (adjacent segments)
      !isPointInList(point, innerPoints)
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
 * @param {*} gridSize
 * Creates a list of path that connect split points, eliminating inner points.
 * Those segments should not connect split points that are immediately one after the other (those are borders).
 */
function getAllSegments(coordList, innerPoints, gridSize) {
  // Removes any inner tile, i.e segments which describe a polygon that cover the whole tile
  const sanitizedCoordList = coordList.filter(
    (coordArray) => !doesSegmentCoverTile(coordArray, gridSize)
  );

  return sanitizedCoordList
    .map((coordArray) => getSegments(coordArray, innerPoints, gridSize))
    .flat();
}

module.exports = { getAllSegments, getStartPoint };

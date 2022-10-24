const { GRID_POINT_TYPES } = require("./constants/gridPointTypes");

function max(pointArray, coord) {
  let max;
  pointArray.map((pt) => {
    if (!max) {
      max = pt[coord];
    } else if (pt[coord] > max) {
      max = pt[coord];
    }
  });
  return max;
}

function min(pointArray, coord) {
  let min;
  pointArray.map((pt) => {
    if (!min) {
      min = pt[coord];
    } else if (pt[coord] < min) {
      min = pt[coord];
    }
  });
  return min;
}

function flattenDoubleArray(arr) {
  const result = [];
  arr.map((innerArr) => innerArr.map((el) => result.push(el)));
  return result;
}

function findPointIndex(pointArr, point) {
  let index = -1;
  pointArr.map((el, idx) => {
    if (index === -1 && arePointsEqual(el, point)) {
      index = idx;
    }
  });
  return index;
}

function substractPoints(resultPointArr, removedPointArr) {
  removedPointArr.map((val) => {
    const idx = findPointIndex(resultPointArr, val);
    if (idx > -1) {
      resultPointArr.splice(idx, 1);
    }
  });
}

function mapFrom(arr, start, callback) {
  const length = arr.length;
  return arr.map((val, idx) => {
    const newIdx = idx + start < length ? idx + start : idx + start - length;
    return callback(arr[newIdx], newIdx);
  });
}

function genArray(start, stop, diff) {
  let arr = [];
  let value = start;
  while (value <= stop) {
    arr.push(value);
    value = value + diff;
  }
  return arr;
}

function pushArray(arr1, arr2) {
  arr2.map((el) => arr1.push(el));
}

function roundedTo(x, n) {
  return Math.floor(x / n) * n;
}

function eqArr(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  return arr1.every((el, idx) => el === arr2[idx]);
}

function arePointsEqual(p1, p2) {
  return eqArr(p1, p2);
}

function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}

function includeArr(arr, val) {
  return !!arr.find((el) => eqArr(el, val));
}

function getSplitPoints(segment, gridSize) {
  const x1 = segment[0][0];
  const y1 = segment[0][1];
  const x2 = segment[1][0];
  const y2 = segment[1][1];
  const r = (y2 - y1) / (x2 - x1);

  const points = [];

  //Cross at least one vertical line
  if (
    roundedTo(Math.max(x1, x2), gridSize) !==
    roundedTo(Math.min(x1, x2), gridSize)
  ) {
    let xline = roundedTo(Math.max(x1, x2), gridSize);
    while (xline <= Math.max(x1, x2) && xline >= Math.min(x1, x2)) {
      const newPoint = [xline, (xline - x1) * r + y1];
      if (!includeArr(segment, newPoint)) {
        points.push(newPoint);
      }
      xline -= gridSize;
    }
  }

  //Cross at least one horizontal line
  if (
    roundedTo(Math.max(y1, y2), gridSize) !==
    roundedTo(Math.min(y1, y2), gridSize)
  ) {
    let yline = roundedTo(Math.max(y1, y2), gridSize);
    while (yline <= Math.max(y1, y2) && yline >= Math.min(y1, y2)) {
      const newPoint = [(yline - y1) / r + x1, yline];
      if (
        !includeArr(segment, newPoint) &&
        !includeArr(points || [], newPoint)
      ) {
        points.push(newPoint);
      }
      yline -= gridSize;
    }
  }

  //Sort points by distance to [x1,y1]
  const sortedPoints = [];
  while (points.length > 0) {
    let minDistance = null;
    let minDistancePoint = null;
    let minDistanceIdx = null;
    points.map((point, idx) => {
      const dist = distance([x1, y1], point);
      if (minDistance === null || dist < minDistance) {
        minDistance = dist;
        minDistancePoint = point;
        minDistanceIdx = idx;
      }
    });
    sortedPoints.push(minDistancePoint);
    points.splice(minDistanceIdx, 1);
  }

  return sortedPoints;
}

/* WARNING: The following utils have been intended to work on data that was already split
 */

/**
 *
 * @param {*} originalArray
 * @param {*} newStartIndex
 * @returns array
 * Rotates the array value so that the array starts with the new start index
 */
function rotateArray(originalArray, newStartIndex) {
  return originalArray
    .slice(newStartIndex)
    .concat(originalArray.slice(0, newStartIndex));
}

/**
 *
 * @param {*} point
 * @param {*} pointList
 * @returns boolean
 * Returns whether the point is in the point list
 */
function isPointInList(point, pointList) {
  return pointList.some((pointOfList) => arePointsEqual(pointOfList, point));
}

/**
 *
 * @param {*} idx
 * @param {*} pointList
 * @returns point
 * Returns the next point of the path given that the path is condired cyclic
 */
function getNextPointByIdx(idx, pointList) {
  return pointList[idx + 1 === pointList.length ? 0 : idx + 1];
}

/**
 *
 * @param {*} idx
 * @param {*} pointList
 * @returns point
 * Returns the previous point of the path given that the path is condired cyclic
 */
function getPreviousPointByIdx(idx, pointList) {
  return pointList[idx - 1 >= 0 ? idx - 1 : pointList.length - 1];
}

/**
 * @param {*} point
 * @param {*} gridSize
 * @returns boolean
 * Returns whether the point is a grid point (see grid point definition in README)
 */
function isGridPoint(point, gridSize) {
  return point[0] % gridSize === 0 || point[1] % gridSize === 0;
}

/**
 * @param {*} point
 * @param {*} gridSize
 * @returns any of GRID_POINT_TYPES
 * Returns whether the type of grid point, depending one type of gridline(s) it is on
 */
function getGridPointType(point, gridSize) {
  const isPointOnVerticalGridLine = point[0] % gridSize === 0;
  const isPointOnHorizontalGridLine = point[1] % gridSize === 0;

  if (isPointOnVerticalGridLine && !isPointOnHorizontalGridLine) {
    return GRID_POINT_TYPES.VERTICAL;
  }

  if (!isPointOnVerticalGridLine && isPointOnHorizontalGridLine) {
    return GRID_POINT_TYPES.HORIZONTAL;
  }

  if (isPointOnVerticalGridLine && isPointOnHorizontalGridLine) {
    return GRID_POINT_TYPES.BOTH;
  }

  if (!isPointOnVerticalGridLine && !isPointOnHorizontalGridLine) {
    return GRID_POINT_TYPES.NONE;
  }
}

/**
 * @param {*} idx
 * @param {*} pointList
 * @param {*} gridSize
 * @returns boolean
 * Returns whether the point pointList[idx] is a split point (see split point definition in README)
 */
function isSplitPointByIdx(idx, pointList, gridSize) {
  const gridPointType = getGridPointType(pointList[idx], gridSize);
  if (gridPointType === GRID_POINT_TYPES.NONE) {
    return false;
  }

  const previousPoint = getPreviousPointByIdx(idx, pointList);
  const nextPoint = getNextPointByIdx(idx, pointList);

  // Checks if the coordinates are on different sides of the gridline depending on the gridPointType
  switch (gridPointType) {
    case GRID_POINT_TYPES.VERTICAL:
      return (
        Math.floor(previousPoint[0] / gridSize) !==
        Math.floor(nextPoint[0] / gridSize)
      );
    case GRID_POINT_TYPES.HORIZONTAL:
      return (
        Math.floor(previousPoint[1] / gridSize) !==
        Math.floor(nextPoint[1] / gridSize)
      );
    case GRID_POINT_TYPES.BOTH:
      return (
        Math.floor(previousPoint[0] / gridSize) !==
          Math.floor(nextPoint[0] / gridSize) ||
        Math.floor(previousPoint[1] / gridSize) !==
          Math.floor(nextPoint[1] / gridSize)
      );
    default:
      return false;
  }
}

/**
 * @param {*} idx
 * @param {*} pointList
 * @param {*} gridSize
 * @returns boolean
 * Returns whether the point pointList[idx] is a bounce point (see bounce point definition in README)
 */
function isBouncePointByIdx(idx, pointList, gridSize) {
  const gridPointType = getGridPointType(pointList[idx], gridSize);
  if (gridPointType === GRID_POINT_TYPES.NONE) {
    return false;
  }

  const currentPoint = pointList[idx];
  const previousPoint = getPreviousPointByIdx(idx, pointList);
  const nextPoint = getNextPointByIdx(idx, pointList);

  // Checks if the coordinates are on same sides of the gridline depending on the gridPointType
  switch (gridPointType) {
    case GRID_POINT_TYPES.VERTICAL:
      return (
        previousPoint[0] !== currentPoint[0] &&
        nextPoint[0] !== currentPoint[0] &&
        Math.floor(previousPoint[0] / gridSize) ===
          Math.floor(nextPoint[0] / gridSize)
      );
    case GRID_POINT_TYPES.HORIZONTAL:
      return (
        previousPoint[1] !== currentPoint[1] &&
        nextPoint[1] !== currentPoint[1] &&
        Math.floor(previousPoint[1] / gridSize) ===
          Math.floor(nextPoint[1] / gridSize)
      );
    case GRID_POINT_TYPES.BOTH:
      return (
        previousPoint[0] !== currentPoint[0] &&
        previousPoint[1] !== currentPoint[1] &&
        nextPoint[0] !== currentPoint[0] &&
        nextPoint[1] !== currentPoint[1] &&
        Math.floor(previousPoint[0] / gridSize) ===
          Math.floor(nextPoint[0] / gridSize) &&
        Math.floor(previousPoint[1] / gridSize) ===
          Math.floor(nextPoint[1] / gridSize)
      );
    default:
      return false;
  }
}

/**
 *
 * @param {*} segment
 * @param {*} gridSize
 * @returns boolean
 * Returns whether the segment covers the whole tile (i.e that polygon = the tile)
 * WARNING: assumes the tile is a square
 */
function doesSegmentCoverTile(segment, gridSize) {
  if (segment.length !== 4) {
    return false;
  }
  return segment.every(
    (point) => getGridPointType(point, gridSize) === GRID_POINT_TYPES.BOTH
  );
}

module.exports = {
  max,
  min,
  flattenDoubleArray,
  findPointIndex,
  substractPoints,
  mapFrom,
  genArray,
  pushArray,
  arePointsEqual,
  distance,
  includeArr,
  getSplitPoints,
  isGridPoint,
  isSplitPointByIdx,
  rotateArray,
  isPointInList,
  getNextPointByIdx,
  getPreviousPointByIdx,
  getGridPointType,
  isBouncePointByIdx,
  doesSegmentCoverTile,
};

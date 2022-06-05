var min = require('./utils').min
var max = require('./utils').max
var findPointIndex = require('./utils').findPointIndex
var mapFrom = require('./utils').mapFrom
var arePointsEqual = require('./utils').arePointsEqual
var flattenDoubleArray = require('./utils').flattenDoubleArray
var distance = require('./utils').distance

function isOnSquareSide(minX, maxX, minY, maxY, point) {
  const validCoordX = [minX, maxX];
  const validCoordY = [minY, maxY];
  return (
    (validCoordX.includes(point[0]) && point[1] >= minY && point[1] <= maxY) ||
    validCoordY.includes(point[1]) && point[0] >= minX && point[0] <= maxX)
};

function isOnSingleSide(path) {
  return path.every(point => point[0] === path[0][0]) || path.every(point => point[1] === path[0][1])
};

function isAdjacentAngle(point, prevPoint, nextPoint, type) {
  const coord = type === 'vertical' ? 0 : 1;

  return ((prevPoint[coord] > point[coord]) &&
    (nextPoint[coord] > point[coord])) ||
    ((prevPoint[coord] < point[coord]) &&
      (nextPoint[coord] < point[coord]))
};

function isInSquare(minX, maxX, minY, maxY, point) {
  return point[0] >= minX &&
    point[0] <= maxX &&
    point[1] >= minY &&
    point[1] <= maxY
}

function isStrictlyInSquare(minX, maxX, minY, maxY, point) {
  return point[0] > minX &&
    point[0] < maxX &&
    point[1] > minY &&
    point[1] < maxY
}

//Gives the side of the square on which the split point is
//Do not handle corners !!!
function splitSquareSide(minX, maxX, minY, maxY, splitPoint) {
  if (splitPoint[0] === minX) {
    return 'left'
  }
  if (splitPoint[0] === maxX) {
    return 'right'
  }
  if (splitPoint[1] === minY) {
    return 'bottom'
  }
  if (splitPoint[1] === maxY) {
    return 'top'
  }
}

//Handle corners with selection of the belonging side
function splitSquareSide2(minX, maxX, minY, maxY, splitPoint) {
  if (splitPoint[0] === minX && splitPoint[1] < maxY) { return 'left' }
  if (splitPoint[0] === maxX && splitPoint[1] > minY) { return 'right' }
  if (splitPoint[1] === minY && splitPoint[0] > minX) { return 'bottom' }
  if (splitPoint[1] === maxY && splitPoint[0] < maxX) { return 'top' }
}

function areOnSameSide(pointA, pointB) {
  return pointA[0] === pointB[0] || pointA[1] === pointB[1]
}

//Gives if the point is at the corner of the square
function isInCorner(minX, maxX, minY, maxY, point) {
  const validCoord = [minX, maxX, minY, maxY];
  return validCoord.includes(point[0]) && validCoord.includes(point[1])
}

function adjacentPathReference(point, cloudPoint, commonCoord) {
  const path = [point];
  const originIdx = findPointIndex(cloudPoint, point);
  let maxIdx = originIdx;

  //Find path inline
  mapFrom(cloudPoint, originIdx, (pt, idx) => {
    if (idx - maxIdx === 1 && point[commonCoord] === pt[commonCoord]) {
      maxIdx = idx;
      path.push(pt)
    }
  })
  cloudPoint.reverse()
  let minIdx = findPointIndex(cloudPoint, point);
  mapFrom(cloudPoint, originIdx, (pt, idx) => {
    if (idx - minIdx === 1 && point[commonCoord] === cloudPoint[minIdx][commonCoord]) {
      minIdx = idx;
      path.splice(0, 0, pt);
    }
  })
  cloudPoint.reverse();

  //Add next and previous point
  const prevPoint = cloudPoint[minIdx === 0 ? cloudPoint.length - 1 : minIdx - 1]
  const nextPoint = cloudPoint[maxIdx === cloudPoint.length - 1 ? 0 : maxIdx + 1]
  path.splice(0, 0, prevPoint);
  path.push(nextPoint);
  return path
}

function isInAdjacentPath(point, prevPoint, nextPoint, pointCloud, commonCoord) {
  if (
    !(point[commonCoord] === prevPoint[commonCoord]) &&
    !(point[commonCoord] === nextPoint[commonCoord])
  ) {
    return false
  }
  const adjPathRef = adjacentPathReference(point, pointCloud, commonCoord);
  const progressCoord = commonCoord === 0 ? 1 : 0;
  return (
    (point[progressCoord] > adjPathRef[0][progressCoord] &&
      point[progressCoord] > adjPathRef[adjPathRef.length - 1][progressCoord]) ||
    (point[progressCoord] < adjPathRef[0][progressCoord] &&
      point[progressCoord] < adjPathRef[adjPathRef.length - 1][progressCoord])
  )
}

function isFirstPointInCrossingAdjacentPath(point, prevPoint, nextPoint, pointCloud, commonCoord) {
  if (
    !(point[commonCoord] === prevPoint[commonCoord]) &&
    !(point[commonCoord] === nextPoint[commonCoord])
  ) {
    return false
  }
  const adjPathRef = adjacentPathReference(point, pointCloud, commonCoord);
  const progressCoord = commonCoord === 0 ? 1 : 0;
  if (
    (point[progressCoord] > adjPathRef[0][progressCoord] &&
      point[progressCoord] < adjPathRef[adjPathRef.length - 1][progressCoord]) ||
    (point[progressCoord] < adjPathRef[0][progressCoord] &&
      point[progressCoord] > adjPathRef[adjPathRef.length - 1][progressCoord])
  ) {
    return findPointIndex(pointCloud, point) === 1;
  }
  return false;
}

function isPointStrictlyInMiddle(startPoint, endPoint, point, commonCoord, progressCoord) {
  return (((endPoint[progressCoord] < startPoint[progressCoord]) &&
    (point[progressCoord] < startPoint[progressCoord]) &&
    (point[progressCoord] > endPoint[progressCoord])) ||
    ((endPoint[progressCoord] > startPoint[progressCoord]) &&
      (point[progressCoord] > startPoint[progressCoord]) &&
      (point[progressCoord] < endPoint[progressCoord]))) &&
    (point[commonCoord] === startPoint[commonCoord])
}

function crossPointNb(startPoint, endPoint, pointCloud) {
  const commonCoord = startPoint[0] === endPoint[0] ? 0 : 1;
  const progressCoord = startPoint[0] === endPoint[0] ? 1 : 0;
  return pointCloud.filter((point, idx) => {
    //Keep endPoint if involved in an adjacent path
    if (arePointsEqual(endPoint, point)) {
      const prevPoint = pointCloud[idx === 0 ? pointCloud.length - 1 : idx - 1]
      const nextPoint = pointCloud[idx === pointCloud.length - 1 ? 0 : idx + 1]
      if (
        isPointStrictlyInMiddle(startPoint, endPoint, prevPoint, commonCoord, progressCoord) ||
        isPointStrictlyInMiddle(startPoint, endPoint, nextPoint, commonCoord, progressCoord)
      ) {
        return true;
      }
    }
    //Check if the point is in the middle
    return isPointStrictlyInMiddle(startPoint, endPoint, point, commonCoord, progressCoord)
  }).filter(point => {
    //Check if the inline points or bounce points should be counted
    const idx = findPointIndex(pointCloud, point);
    const prevPoint = pointCloud[idx === 0 ? pointCloud.length - 1 : idx - 1]
    const nextPoint = pointCloud[idx === pointCloud.length - 1 ? 0 : idx + 1]

    return (!isAdjacentAngle(point, prevPoint, nextPoint, commonCoord === 0 ? 'vertical' : 'horizontal') &&
      !isInAdjacentPath(point, prevPoint, nextPoint, pointCloud, commonCoord)) ||
      isFirstPointInCrossingAdjacentPath(point, prevPoint, nextPoint, pointCloud, commonCoord)
  }).length
}

function getPolygonOuterPoint(point, polygonPoints, side) {
  switch (side) {
    case 'left':
      return [min(polygonPoints, 0) - 1, point[1]];
    case 'right':
      return [max(polygonPoints, 0) + 1, point[1]];
    case 'bottom':
      return [point[0], min(polygonPoints, 1) - 1];
    case 'top':
      return [point[0], max(polygonPoints, 1) + 1];
  }
}

function isInnerCorner(minX, maxX, minY, maxY, point, polygonPoints) {
  const topRef = [point[0], max(polygonPoints, 1) + 1];
  const bottomRef = [point[0], min(polygonPoints, 1) - 1];
  const rightRef = [max(polygonPoints, 0) + 1, point[1]];
  const leftRef = [min(polygonPoints, 0) - 1, point[1]];

  if (arePointsEqual([minX, minY], point)) {
    return crossPointNb(topRef, point, polygonPoints) % 2 === 1 ||
      crossPointNb(rightRef, point, polygonPoints) % 2 === 1
  }
  if (arePointsEqual([minX, maxY], point)) {
    return crossPointNb(bottomRef, point, polygonPoints) % 2 === 1 ||
      crossPointNb(rightRef, point, polygonPoints) % 2 === 1
  }
  if (arePointsEqual([maxX, maxY], point)) {
    return crossPointNb(bottomRef, point, polygonPoints) % 2 === 1 ||
      crossPointNb(leftRef, point, polygonPoints) % 2 === 1
  }
  if (arePointsEqual([maxX, minY], point)) {
    return crossPointNb(topRef, point, polygonPoints) % 2 === 1 ||
      crossPointNb(leftRef, point, polygonPoints) % 2 === 1
  }
}

function isStrictInnerCorner(minX, maxX, minY, maxY, point, polygonPoints) {
  const topRef = [point[0], max(polygonPoints, 1) + 1];
  const bottomRef = [point[0], min(polygonPoints, 1) - 1];
  const rightRef = [max(polygonPoints, 0) + 1, point[1]];
  const leftRef = [min(polygonPoints, 0) - 1, point[1]];

  if (arePointsEqual([minX, minY], point)) {
    return crossPointNb(topRef, point, polygonPoints) % 2 === 1 &&
      crossPointNb(rightRef, point, polygonPoints) % 2 === 1
  }
  if (arePointsEqual([minX, maxY], point)) {
    return crossPointNb(bottomRef, point, polygonPoints) % 2 === 1 &&
      crossPointNb(rightRef, point, polygonPoints) % 2 === 1
  }
  if (arePointsEqual([maxX, maxY], point)) {
    return crossPointNb(bottomRef, point, polygonPoints) % 2 === 1 &&
      crossPointNb(leftRef, point, polygonPoints) % 2 === 1
  }
  if (arePointsEqual([maxX, minY], point)) {
    return crossPointNb(topRef, point, polygonPoints) % 2 === 1 &&
      crossPointNb(leftRef, point, polygonPoints) % 2 === 1
  }
}

function isBouncePoint(minX, maxX, minY, maxY, point, prevPoint, nextPoint) {
  return isInSquare(minX, maxX, minY, maxY, point) &&
    !isInSquare(minX, maxX, minY, maxY, nextPoint) &&
    !isInSquare(minX, maxX, minY, maxY, prevPoint)
}

function isEntryPoint(minX, maxX, minY, maxY, point, prevPoint, nextPoint) {
  return isInSquare(minX, maxX, minY, maxY, point) &&
    isInSquare(minX, maxX, minY, maxY, nextPoint) &&
    !isInSquare(minX, maxX, minY, maxY, prevPoint)
}

function isSimpleEntryPoint(minX, maxX, minY, maxY, point, prevPoint) {
  return isInSquare(minX, maxX, minY, maxY, point) &&
    !isInSquare(minX, maxX, minY, maxY, prevPoint)
}

function isInjectedEntryPoint(minX, maxX, minY, maxY, point, followingPoint) {
  return isOnSquareSide(minX, maxX, minY, maxY, point) &&
    (
      isStrictlyInSquare(minX, maxX, minY, maxY, followingPoint) ||
      (
        isOnSquareSide(minX, maxX, minY, maxY, followingPoint) &&
        !areOnSameSide(point, followingPoint)
      )
    )
}

function getCommonCoord(pointA, pointB) {
  if (pointA[0] === pointB[0]) {
    return 0;
  } else if (pointA[1] === pointB[1]) {
    return 1;
  }
  return null;
}

function isAdjacentEndExt(minX, maxX, minY, maxY, followedPoint, point, pointCloud) {
  //Get direction where to count cross points
  let direction;
  const commonCoord = getCommonCoord(followedPoint, point);
  if (commonCoord === 1) {
    if (followedPoint[0] > point[0]) { direction = 'left' }
    else { direction = 'right' }
  }
  if (commonCoord === 0) {
    if (followedPoint[1] > point[1]) { direction = 'bottom' }
    else { direction = 'top' }
  }
  if (arePointsEqual([minX, minY], point)) {
    if (direction === 'bottom') { direction = 'right' }
    if (direction === 'left') { direction = 'top' }
  }
  if (arePointsEqual([minX, maxY], point)) {
    if (direction === 'top') { direction = 'right' }
    if (direction === 'left') { direction = 'bottom' }
  }
  if (arePointsEqual([maxX, maxY], point)) {
    if (direction === 'top') { direction = 'left' }
    if (direction === 'right') { direction = 'bottom' }
  }
  if (arePointsEqual([maxX, minY], point)) {
    if (direction === 'bottom') { direction = 'left' }
    if (direction === 'right') { direction = 'top' }
  }
  //Count points
  const ref = getPolygonOuterPoint(point, pointCloud, direction)
  const isExt = crossPointNb(ref, point, pointCloud) % 2 === 0;
  return isExt;
}

function hasFollowingPoint(minX, maxX, minY, maxY, originPoint, pointSubset) {
  const side = splitSquareSide2(minX, maxX, minY, maxY, originPoint);
  return flattenDoubleArray(pointSubset
    .map(path => {
      if (path.length === 1) {
        return path[0];
      } else if (path.length > 1) {
        return [path[0], path[path.length - 1]];
      }
    })
  ).filter(point => {
    switch (side) {
      case 'left':
        return point[0] === minX && point[1] > originPoint[1]
      case 'right':
        return point[0] === maxX && point[1] < originPoint[1]
      case 'bottom':
        return point[1] === minY && point[0] < originPoint[0]
      case 'top':
        return point[1] === maxY && point[0] > originPoint[0]
    }
  }).length > 0
}

//Adds points to close a polygon which path points bounces corner inside
function fixBunk(minX, maxX, minY, maxY, path, flattenedFeaturePoints) {
  const addList = path.filter((point, idx) =>
    idx > 0 &&
    idx < path.length - 1 &&
    isInCorner(minX, maxX, minY, maxY, point) &&
    isStrictInnerCorner(minX, maxX, minY, maxY, point, flattenedFeaturePoints) //BAD STUFF TO FLATTEN
  )
  return path.concat(addList.reverse())
}

//Determine rotation direction
function getClockwiseAngle(prevPoint, point, nextPoint) {
  const normU = distance(prevPoint, point)
  const normV = distance(point, nextPoint)
  const uX = point[0] - prevPoint[0];
  const uY = point[1] - prevPoint[1];
  const vX = nextPoint[0] - point[0];
  const vY = nextPoint[1] - point[1];
  const crossP = uX * vX + uY * vY;

  const angle = Math.acos(crossP / (normU * normV))
  const det = uX * vY - uY * vX;

  if (det > 0) {
    return angle
  }
  return -angle
}

function setClockwiseRotation(path) {
  let sum = 0
  path.map((point, idx) => {
    const prevPoint = path[idx === 0 ? path.length - 1 : idx - 1];
    const nextPoint = path[idx === path.length - 1 ? 0 : idx + 1];
    sum += getClockwiseAngle(prevPoint, point, nextPoint)
  })
  if (sum > 0) {
    path.reverse()
  }
}

module.exports = {
  areOnSameSide,
  isOnSquareSide,
  isInSquare,
  isStrictlyInSquare,
  splitSquareSide,
  splitSquareSide2,
  isInCorner,
  isPointStrictlyInMiddle,
  crossPointNb,
  getPolygonOuterPoint,
  isInnerCorner,
  isBouncePoint,
  isEntryPoint,
  isSimpleEntryPoint,
  hasFollowingPoint,
  isInjectedEntryPoint,
  isAdjacentEndExt,
  isOnSingleSide,
  fixBunk,
  setClockwiseRotation,
}

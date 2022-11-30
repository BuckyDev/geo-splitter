/* 
  This final method is a better alternative to the edge case or classic merger
  Is uses the property of corner point and virtual corner point which are known 
  respectively inside or outide a polygon
*/

var isInCorner = require('./pointUtils').isInCorner
var crossPointNb = require('./pointUtils').crossPointNb
var getPolygonOuterPoint = require('./pointUtils').getPolygonOuterPoint
var splitSquareSide2 = require('./pointUtils').splitSquareSide2
var hasFollowingPoint = require('./pointUtils').hasFollowingPoint
var isOnSquareSide = require('./pointUtils').isOnSquareSide
var fixBunk = require('./pointUtils').fixBunk

var includeArr = require('./utils').includeArr
var pushArray = require('./utils').pushArray
var distance = require('./utils').distance
var arePointsEqual = require('./utils').arePointsEqual
var substractPoints = require('./utils').substractPoints
var flattenDoubleArray = require('./utils').flattenDoubleArray

var C = require('./consoleManager').C;

function orderCornerPoints(minX, maxX, minY, maxY, cornerPointSubset) {
  const result = [];
  if (includeArr(cornerPointSubset, [maxX, minY])) { result.push([maxX, minY]) }
  if (includeArr(cornerPointSubset, [maxX, maxY])) { result.push([maxX, maxY]) }
  if (includeArr(cornerPointSubset, [minX, maxY])) { result.push([minX, maxY]) }
  if (includeArr(cornerPointSubset, [minX, minY])) { result.push([minX, minY]) }
  return result;
}

//Functions for paths with corner points
function findNextPoint(originPoint, minX, maxX, minY, maxY, pointSubset, orderedCornerPoints) {
  //Build an array of candidates
  let pointsToCheck = [];
  pointSubset.map(path => {
    pointsToCheck.push(path[0]);
    if (path.length > 1) {
      pointsToCheck.push(path[path.length - 1]);
    }
  })
  pushArray(pointsToCheck, orderedCornerPoints);
  const side = splitSquareSide2(minX, maxX, minY, maxY, originPoint);
  pointsToCheck = pointsToCheck.filter(point => {
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
  })

  //Early return if no candidates
  if (pointsToCheck.length === 0) {
    return null;
  }

  //Find the closest point
  let closestPoint;
  let smallestDistance;
  pointsToCheck.map(point => {
    if (!closestPoint) {
      smallestDistance = distance(originPoint, point)
      closestPoint = point
    } else if (distance(originPoint, point) < smallestDistance) {
      smallestDistance = distance(originPoint, point)
      closestPoint = point
    }
  })

  return closestPoint;
}

function pushToPathAndReturnNext(newPath, closestPoint, pointSubset, orderedCornerPoints) {
  //Handles if closestPoint is in a path
  let pointsToAdd = [];
  pointSubset.map((path, idx) => {
    if (arePointsEqual(path[0], closestPoint)) {
      pointsToAdd = pointSubset[idx]
      pointSubset.splice(idx, 1)
    } else if (arePointsEqual(path[path.length - 1], closestPoint)) {
      pointsToAdd = pointSubset[idx].reverse()
      pointSubset.splice(idx, 1)
    }
  })

  if (pointsToAdd.length > 0) {
    pushArray(newPath, pointsToAdd)
    return pointsToAdd[pointsToAdd.length - 1]
  }

  //Handles if closestPoint is a cornerPoint
  if (includeArr(orderedCornerPoints, closestPoint)) {
    substractPoints(orderedCornerPoints, [closestPoint])
    pushArray(newPath, [closestPoint])
    return closestPoint
  }
}

function buildPath(start, minX, maxX, minY, maxY, pointSubset, orderedCornerPoints) {
  let newPath = [];
  let currentPoint = start;
  newPath.push(start)

  while (currentPoint) {
    const closestPoint = findNextPoint(currentPoint, minX, maxX, minY, maxY, pointSubset, orderedCornerPoints);
    currentPoint = closestPoint
      ? pushToPathAndReturnNext(newPath, closestPoint, pointSubset, orderedCornerPoints)
      : null;
  }
  return newPath;
}

//Functions for paths without corners
function findDirection(point, minX, maxX, minY, maxY, flattenedFeaturePoints) {

  const side = splitSquareSide2(minX, maxX, minY, maxY, point);

  //Process virtual point is a corner path point
  let reference;
  switch (side) {
    case 'left':
      reference = getPolygonOuterPoint(point, flattenedFeaturePoints, 'top');
      break;
    case 'right':
      reference = getPolygonOuterPoint(point, flattenedFeaturePoints, 'bottom');
      break;
    case 'bottom':
      reference = getPolygonOuterPoint(point, flattenedFeaturePoints, 'left');
      break;
    case 'top':
      reference = getPolygonOuterPoint(point, flattenedFeaturePoints, 'right');
      break;
  }
  const crossPointsCount = crossPointNb(reference, point, flattenedFeaturePoints);
  //Return direction out of cross point count
  return crossPointsCount % 2 === 1 ? 'clockwise' : 'anticlockwise' ;
}

function findNextPointOnVirtual(originPoint, direction, minX, maxX, minY, maxY, pointSubset) {
  //Build an array of candidates
  let pointsToCheck = [];
  pointSubset.map(path => {
    pointsToCheck.push(path[0]);
    if (path.length > 1) {
      pointsToCheck.push(path[path.length - 1]);
    }
  })

  const side = splitSquareSide2(minX, maxX, minY, maxY, originPoint);
  //Filter candidate taking in count if the origin is in a corner
  if (isInCorner(minX, maxX, minY, maxY, originPoint)) {
    pointsToCheck = pointsToCheck.filter(point => {
      switch (side) {
        case 'left':
          return direction === 'clockwise' ? (point[0] === minX && point[1] > originPoint[1]) : (point[1] === minY && point[0] > originPoint[0])
        case 'right':
          return direction === 'clockwise' ? (point[0] === maxX && point[1] < originPoint[1]) : (point[1] === maxY && point[0] < originPoint[0])
        case 'bottom':
          return direction === 'clockwise' ? (point[1] === minY && point[0] < originPoint[0]) : (point[0] === maxX && point[1] > originPoint[1])
        case 'top':
          return direction === 'clockwise' ? (point[1] === maxY && point[0] > originPoint[0]) : (point[0] === minX && point[1] < originPoint[1])
      }
    })
  } else {
    pointsToCheck = pointsToCheck.filter(point => {
      switch (side) {
        case 'left':
          return point[0] === minX && (direction === 'clockwise' ? point[1] > originPoint[1] : point[1] < originPoint[1])
        case 'right':
          return point[0] === maxX && (direction === 'clockwise' ? point[1] < originPoint[1] : point[1] > originPoint[1])
        case 'bottom':
          return point[1] === minY && (direction === 'clockwise' ? point[0] < originPoint[0] : point[0] > originPoint[0])
        case 'top':
          return point[1] === maxY && (direction === 'clockwise' ? point[0] > originPoint[0] : point[0] < originPoint[0])
      }
    })
  }

  //Early return if no candidates
  if (pointsToCheck.length === 0) {
    return null;
  }

  //Find the closest point
  let closestPoint;
  let smallestDistance;
  pointsToCheck.map(point => {
    if (!closestPoint) {
      smallestDistance = distance(originPoint, point)
      closestPoint = point
    } else if (distance(originPoint, point) < smallestDistance) {
      smallestDistance = distance(originPoint, point)
      closestPoint = point
    }
  })

  return closestPoint;

}

function pushToPathAndReturnNextOnVirtual(newPath, closestPoint, pointSubset) {
  let pointsToAdd = [];
  pointSubset.map((path, idx) => {
    if (arePointsEqual(path[0], closestPoint)) {
      pointsToAdd = pointSubset[idx]
      pointSubset.splice(idx, 1)
    } else if (arePointsEqual(path[path.length - 1], closestPoint)) {
      pointsToAdd = pointSubset[idx].reverse()
      pointSubset.splice(idx, 1)
    }
  })

  if (pointsToAdd.length > 0) {
    pushArray(newPath, pointsToAdd)
    return pointsToAdd[pointsToAdd.length - 1]
  }
}

function buildPathOnVirtual(minX, maxX, minY, maxY, pointSubset, flattenedFeaturePoints, featureId = null) {
  //Setting up a start point to run the path builder
  const virtualPoints = [
    [minX, minY],
    [minX, maxY],
    [maxX, maxY],
    [maxX, minY]
  ]
  let start;
  let foundStartPoint;
  virtualPoints.map(virtualPoint => {
    if (
      !foundStartPoint &&
      hasFollowingPoint(minX, maxX, minY, maxY, virtualPoint, pointSubset)
    ) {
      foundStartPoint = true
      start = virtualPoint
    }
  })

  let newPath = [];
  let currentPoint = start;
  let first = true
  let securityIdx = 0;
  //Roam the path collection around the square
  while (currentPoint && securityIdx < 1000) {
    const direction = first ? 'clockwise' : findDirection(currentPoint, minX, maxX, minY, maxY, flattenedFeaturePoints);
    const closestPoint = findNextPointOnVirtual(currentPoint, direction, minX, maxX, minY, maxY, pointSubset);
    first = false
    if (closestPoint) {
      currentPoint = pushToPathAndReturnNextOnVirtual(newPath, closestPoint, pointSubset)
      /* if(arePointsEqual(closestPoint, start)){
        currentPoint = null;
      } */
    } else {
      currentPoint = null;
    }
    securityIdx++;
  }
  if(securityIdx === 1000){
    console.error(`Process got stuck in a while loop: buildPathOnVirtual(${minX}, ${maxX}, ${minY}, ${maxY}, ...)`)
  }
  return newPath;
}

function cornerPointMerger(minX, maxX, minY, maxY, pointSubset, cornerPointSubset, featurePoints, featureId = null) {
  //Error copies
  const errorPointSubset = [...pointSubset];
  const errorCornerPointSubset = [...cornerPointSubset];
  //Early returns
  if (pointSubset.length === 0 && cornerPointSubset.length === 0) return pointSubset; //Empty area
  const newSubset = []
  const orderedCornerPoints = orderCornerPoints(minX, maxX, minY, maxY, cornerPointSubset);
  const flattenedFeaturePoints = flattenDoubleArray(featurePoints); //COULD BE A BAD STUFF TO FLATTEN

  //If there's corner points, bind all related polygons until there's no unused corner point left
  if (orderedCornerPoints.length > 0) {
    let securityIdx = 0;
    while (orderedCornerPoints.length > 0 && securityIdx < 1000) {
      const start = orderedCornerPoints.pop();
      const newPath = buildPath(start, minX, maxX, minY, maxY, pointSubset, orderedCornerPoints);
      newSubset.push(newPath);
      securityIdx++;
      if(featureId === '112-E'){debugger}
    }
    if(securityIdx === 1000){
      console.error(`Process got stuck in a while loop: cornerPointMerger(${minX}, ${maxX}, ${minY}, ${maxY}, ...) with existing corner points`)
      C.pushErrorStack('merger','infiniteWhileCorner', {minX, maxX, minY, maxY, errorPointSubset, errorCornerPointSubset}, {minX, minY, gridSize: Math.abs(maxX-minX), featureId})
    }
  }
  if (pointSubset.length === 0 && orderedCornerPoints.length === 0) return newSubset;

  //Handles single path exclusive polygon => it can only close on itself so it can be added directly
  if (pointSubset.length === 1 && orderedCornerPoints.length === 0) {
    newSubset.push(fixBunk(minX, maxX, minY, maxY, pointSubset[0], flattenedFeaturePoints));
    return newSubset;
  }

  //Handles islands: start point or end point not on a side
  if (pointSubset.length > 0 && orderedCornerPoints.length === 0) {
    const toRemove = []
    pointSubset.map((path, idx) => {
      if (
        !isOnSquareSide(minX, maxX, minY, maxY, path[0]) ||
        !isOnSquareSide(minX, maxX, minY, maxY, path[path.length - 1])
      ) {
        newSubset.push(path)
        toRemove.push(idx)
      }
    })

    toRemove.reverse().map(idx => { pointSubset.splice(idx, 1) })
  }

  //Handles multiple path exclusive polygons
  if (pointSubset.length > 0 && orderedCornerPoints.length === 0) {
    let securityIdx = 0;

    while (pointSubset.length > 0 && securityIdx < 1000) {
      const newPath = buildPathOnVirtual(minX, maxX, minY, maxY, pointSubset, flattenedFeaturePoints, featureId);
      newSubset.push(fixBunk(minX, maxX, minY, maxY, newPath, flattenedFeaturePoints));
      securityIdx++;
    }
    if(securityIdx === 1000){
      console.error(`Process got stuck in a while loop: cornerPointMerger(${minX}, ${maxX}, ${minY}, ${maxY}, ...) with no corner points`)
      C.pushErrorStack('merger','infiniteWhileNoCorner', {minX, maxX, minY, maxY, errorPointSubset, errorCornerPointSubset}, {minX, minY, gridSize: Math.abs(maxX-minX), featureId})
    }
  }
  return newSubset;
}

module.exports = {
  cornerPointMerger
}

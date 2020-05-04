var cornerPointMerger = require('./cornerPointMerger').cornerPointMerger

var crossPointNb = require('./pointUtils').crossPointNb
var getPolygonOuterPoint = require('./pointUtils').getPolygonOuterPoint
var isSimpleEntryPoint = require('./pointUtils').isSimpleEntryPoint
var isInSquare = require('./pointUtils').isInSquare
var isOnSquareSide = require('./pointUtils').isOnSquareSide
var isInnerCorner = require('./pointUtils').isInnerCorner
var isBouncePoint = require('./pointUtils').isBouncePoint
var isInCorner = require('./pointUtils').isInCorner
var areOnSameSide = require('./pointUtils').areOnSameSide
var isInjectedEntryPoint = require('./pointUtils').isInjectedEntryPoint
var isAdjacentEndExt = require('./pointUtils').isAdjacentEndExt
var isOnSingleSide = require('./pointUtils').isOnSingleSide

var genArray = require('./utils').genArray
var getSplitPoints = require('./utils').getSplitPoints
var pushArray = require('./utils').pushArray
var mapFrom = require('./utils').mapFrom
var includeArr = require('./utils').includeArr
var arePointsEqual = require('./utils').arePointsEqual
var flattenDoubleArray = require('./utils').flattenDoubleArray

//Add all missing crossborder points for a polygon
function addSplitPointFeature(coordinates, gridSize) {
  const updatedCoordinates = [];
  coordinates.map(coordinate => {
    const result = [];
    coordinate.map((coord1, idx) => {
      if (
        idx === coordinate.length - 1 &&
        coordinate[idx] === coordinate[0]
      ) {
        return null;
      }
      const coord2 = coordinate[idx + 1] || coordinate[0];
      const extraPoints = getSplitPoints([coord1, coord2], gridSize);

      result.push(coord1)
      pushArray(result, extraPoints)
    })
    updatedCoordinates.push(result)
  })
  return updatedCoordinates;
}

function addSplitPointsAll(data, gridSize) {
  return data.features.map(feature => {
    const enrichedCoordinates = addSplitPointFeature(feature.geometry.coordinates, gridSize);
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: enrichedCoordinates
      }
    }
  })
}

//Generate a collection of points located at an intersection and inside the polygon
function isPointInside(testPoint, feature) {
  const featurePoints = feature.geometry.coordinates;
  return featurePoints.map(polygonPoints => {
    const topRef = getPolygonOuterPoint(testPoint, polygonPoints, 'top');
    const bottomRef = getPolygonOuterPoint(testPoint, polygonPoints, 'bottom');
    const leftRef = getPolygonOuterPoint(testPoint, polygonPoints, 'left');
    const rightRef = getPolygonOuterPoint(testPoint, polygonPoints, 'right');

    const isInTop = crossPointNb(testPoint, topRef, polygonPoints) % 2 === 1;
    const isInBottom = crossPointNb(testPoint, bottomRef, polygonPoints) % 2 === 1;
    const isInLeft = crossPointNb(testPoint, leftRef, polygonPoints) % 2 === 1;
    const isInRight = crossPointNb(testPoint, rightRef, polygonPoints) % 2 === 1;
    return isInTop && isInBottom && isInLeft && isInRight;
  }).includes(true);
}

function generateCornerPoints(data, xStart, xEnd, yStart, yEnd, gridSize) {
  const pointsToTest = []
  genArray(xStart, xEnd, gridSize).map(x => {
    genArray(yStart, yEnd, gridSize).map(y => {
      pointsToTest.push([x, y])
    })
  })

  return data.features.map(feature => {
    const featurePoints = flattenDoubleArray(feature.geometry.coordinates);
    const result = pointsToTest.filter(point => (
      isPointInside(point, feature) &&
      !includeArr(featurePoints, point)
    ))
    return result
  }
  )
}

//Generate the subset for a square area
function buildExcludedAdjacentPathCollection(minX, maxX, minY, maxY, coordinates) {
  const collection = [];

  //Build a collection of all adjacent paths except inner bouncing
  coordinates.map(polygonPoints => {
    //Find point to start roaming
    const start = polygonPoints.findIndex((point, idx) => {
      const prevPoint = polygonPoints[idx === 0 ? polygonPoints.length - 1 : idx - 1]
      return isSimpleEntryPoint(minX, maxX, minY, maxY, point, prevPoint);
    })
    if (start === -1) {
      return null;
    }

    //Roam polygonPoints
    mapFrom(polygonPoints, start, (pt, idx) => {
      const point = polygonPoints[idx]
      const prevPoint = polygonPoints[idx === 0 ? polygonPoints.length - 1 : idx - 1]
      const nextPoint = polygonPoints[idx === polygonPoints.length - 1 ? 0 : idx + 1]

      //Add bounce points
      if (
        isBouncePoint(minX, maxX, minY, maxY, point, prevPoint, nextPoint) &&
        !isInCorner(minX, maxX, minY, maxY, point)
      ) {
        collection.push([point]);
      }
      //Add bounce points in corner which are not relevant
      if (
        isBouncePoint(minX, maxX, minY, maxY, point, prevPoint, nextPoint) &&
        isInCorner(minX, maxX, minY, maxY, point) &&
        !isInnerCorner(minX, maxX, minY, maxY, point, polygonPoints)
      ) {
        collection.push([point]);
      }
      //Add points to last collection path if in an adjacent path, and not first member
      if (
        isOnSquareSide(minX, maxX, minY, maxY, point) &&
        isOnSquareSide(minX, maxX, minY, maxY, prevPoint) &&
        areOnSameSide(point, prevPoint)
      ) {
        collection[collection.length - 1].push(point);
      }
      //Start a new path if first point of a multiple point adjacent path
      if (
        isOnSquareSide(minX, maxX, minY, maxY, point) &&
        (isOnSquareSide(minX, maxX, minY, maxY, nextPoint) &&
          areOnSameSide(point, nextPoint)) &&
        (!isOnSquareSide(minX, maxX, minY, maxY, prevPoint) ||
          !areOnSameSide(point, prevPoint))
      ) {
        collection.push([point]);
      }
    })
  })
  if (minX === 6 && minY === 6) {
    console.log(collection)
  }
  if (collection.length < 1) {
    return collection
  }

  //Filter this collection so that it keeps only what should be removed
  const filteredCollection = [];
  collection.map(path => {
    if (path.length === 1) {
      filteredCollection.push(path)
    } else {
      const polygonPoints = coordinates.length === 1 ?
        coordinates[0] :
        coordinates.find(polygon => includeArr(polygon, path[0]));

      const startPointIndex = polygonPoints.findIndex(point => arePointsEqual(point, path[0]));
      const endPointIndex = polygonPoints.findIndex(point => arePointsEqual(point, path[path.length - 1]));

      const startPoint = polygonPoints[startPointIndex];
      const followingStartPoint = polygonPoints[startPointIndex === 0 ? polygonPoints.length - 1 : startPointIndex - 1];
      const followedStartPoint = polygonPoints[startPointIndex === polygonPoints.length - 1 ? 0 : startPointIndex + 1];

      const endPoint = polygonPoints[endPointIndex];
      const followingEndPoint = polygonPoints[endPointIndex === polygonPoints.length - 1 ? 0 : endPointIndex + 1];
      const followedEndPoint = polygonPoints[endPointIndex === 0 ? polygonPoints.length - 1 : endPointIndex - 1];

      if (minX === 6 && minY === 6) {
        console.log(polygonPoints)
        console.log(isInjectedEntryPoint(minX, maxX, minY, maxY, startPoint, followingStartPoint))
        console.log(isAdjacentEndExt(minX, maxX, minY, maxY, followedStartPoint, startPoint, polygonPoints))
        console.log(isInjectedEntryPoint(minX, maxX, minY, maxY, endPoint, followingEndPoint))
        console.log(isAdjacentEndExt(minX, maxX, minY, maxY, followedEndPoint, endPoint, polygonPoints))
      }

      if (
        (isInjectedEntryPoint(minX, maxX, minY, maxY, startPoint, followingStartPoint) !==
          isAdjacentEndExt(minX, maxX, minY, maxY, followedStartPoint, startPoint, polygonPoints)) &&
        (isInjectedEntryPoint(minX, maxX, minY, maxY, endPoint, followingEndPoint) !==
          isAdjacentEndExt(minX, maxX, minY, maxY, followedEndPoint, endPoint, polygonPoints))
      ) {
        if (isInjectedEntryPoint(minX, maxX, minY, maxY, endPoint, followingEndPoint)) {
          path.splice(path.length - 1, 1)
        }
        if (isInjectedEntryPoint(minX, maxX, minY, maxY, startPoint, followingStartPoint)) {
          path.splice(0, 1)
        }
        if (path.length > 0) {
          filteredCollection.push(path)
        }
      } else if(isOnSingleSide(path)){
        if (
          isInCorner(minX, maxX, minY, maxY, endPoint) ||
          isInjectedEntryPoint(minX, maxX, minY, maxY, endPoint, followingEndPoint)
        ) {
          path.splice(path.length - 1, 1)
        }
        if (
          isInCorner(minX, maxX, minY, maxY, startPoint) ||
          isInjectedEntryPoint(minX, maxX, minY, maxY, startPoint, followingStartPoint)
        ) {
          path.splice(0, 1)
        }
        if (path.length > 0) {
          filteredCollection.push(path)
        }
      }
    }
  })
  return filteredCollection
}

function removeCollection(pointSubset, adjacentPathToExclude) {
  const pointsToRemove = flattenDoubleArray(adjacentPathToExclude)
  return pointSubset.map(path =>
    path.filter(point => !includeArr(pointsToRemove, point))
  ).filter(path => path.length > 0)
}

function generatePointSubset(minX, maxX, minY, maxY, coordinates) {
  const pointSubset = [];
  coordinates.map(polygonPoints => {
    const start = polygonPoints.findIndex((point, idx) => {
      const prevPoint = polygonPoints[idx === 0 ? polygonPoints.length - 1 : idx - 1]
      const nextPoint = polygonPoints[idx === polygonPoints.length - 1 ? 0 : idx + 1]
      return isSimpleEntryPoint(minX, maxX, minY, maxY, point, prevPoint, nextPoint);
    })
    if (start === -1) {
      if (polygonPoints.every(point => isInSquare(minX, maxX, minY, maxY, point))) {
        pointSubset.push(polygonPoints);
      }
      return null;
    }
    let currentPathIdx = -1

    mapFrom(polygonPoints, start, (pt, idx) => {
      const point = polygonPoints[idx]
      const prevPoint = polygonPoints[idx === 0 ? polygonPoints.length - 1 : idx - 1]

      if (isSimpleEntryPoint(minX, maxX, minY, maxY, point, prevPoint)) {
        pointSubset.push([point]);
        currentPathIdx++;
      } else if (isInSquare(minX, maxX, minY, maxY, point)) {
        pointSubset[currentPathIdx].push(point);
      }
    })
  })
  //At this stage, every point included in square area is added

  //Filter all irrelevant paths, subpaths and points
  const adjacentPathToExclude = buildExcludedAdjacentPathCollection(minX, maxX, minY, maxY, coordinates);
  const filteredPointSubset = adjacentPathToExclude.length > 0 ?
    removeCollection(pointSubset, adjacentPathToExclude) :
    pointSubset;
  return filteredPointSubset;
}

function generateCornerPointsSubset(minX, maxX, minY, maxY, cornerPoints) {
  return cornerPoints.filter(point => isInSquare(minX, maxX, minY, maxY, point))
}

function buildAreaSplit(newData, cornerPoints, xStart, xEnd, yStart, yEnd, gridSize) {
  const areas = [];
  genArray(xStart, xEnd - gridSize, gridSize).map(x => {
    genArray(yStart, yEnd - gridSize, gridSize).map(y => {
      const newFeatures = newData.features.map((feature, idx) => {
        const cornerPointSubset = generateCornerPointsSubset(x, x + gridSize, y, y + gridSize, cornerPoints[idx]);
        const pointSubset = generatePointSubset(x, x + gridSize, y, y + gridSize, feature.geometry.coordinates);
        const finalCoordinates = cornerPointMerger(x, x + gridSize, y, y + gridSize, pointSubset, cornerPointSubset, feature.geometry.coordinates);
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: finalCoordinates
          }
        }
      })
      areas.push({
        ...newData,
        features: newFeatures
      })
    })
  })
  return areas;
}

//Final function
function split(data, xStart, xEnd, yStart, yEnd, gridSize) {
  const splitPointsData = addSplitPointsAll(data, gridSize);
  const newData = {
    ...data,
    features: splitPointsData,
  }
  const intersectionPoints = generateCornerPoints(newData, xStart, xEnd, yStart, yEnd, gridSize);
  const splittedData = buildAreaSplit(newData, intersectionPoints, xStart, xEnd, yStart, yEnd, gridSize);
  return splittedData;
}

module.exports = {
  split,
  addSplitPointsAll,
  generateCornerPoints,
  generatePointSubset,
}

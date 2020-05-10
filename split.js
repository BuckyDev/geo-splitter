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
var setClockwiseRotation = require('./pointUtils').setClockwiseRotation

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
      } else if (isOnSingleSide(path)) {
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
      const newFeatures = [];
      newData.features.map((feature, idx) => {
        const cornerPointSubset = generateCornerPointsSubset(x, x + gridSize, y, y + gridSize, cornerPoints[idx]);
        const pointSubset = generatePointSubset(x, x + gridSize, y, y + gridSize, feature.geometry.coordinates);
        const finalCoordinates = cornerPointMerger(x, x + gridSize, y, y + gridSize, pointSubset, cornerPointSubset, feature.geometry.coordinates);
        if (finalCoordinates[0] && finalCoordinates[0].length > 0) {
          finalCoordinates.map((polygonCoords, idx) => {
            setClockwiseRotation(polygonCoords);
            polygonCoords.push(polygonCoords[0]);
            newFeatures.push({
              ...feature,
              properties: {
                ...feature.properties,
                zone: `${x}_${y}`,
                zone_id: idx
              },
              geometry: {
                ...feature.geometry,
                coordinates: [polygonCoords]
              }
            })
          })
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

//Input formatting to ensure function will work.
function formatInput(data) {
  data.features.map(feature => {
    feature.geometry.coordinates.map(polygonCoord => {
      if (arePointsEqual(polygonCoord[0], polygonCoord[polygonCoord.length - 1])) {
        polygonCoord.splice(0, 1)
      }
    })
  })
}

//Pitfalls detection
const errors = {
  nonPolygon: "Split cannot convert non Polygon features yet !",
  enclavePolygon: "Split cannot convert Polygon features with enclaves yet !",
  multiPointPolygon: "Split cannot convert Polygon features that includes same point several time yet!",
}

function inputAnalysis(data) {
  console.log(`Data analysis started`)
  const errorStack = {
    nonPolygon: [],
    enclavePolygon: [],
    multiPointPolygon: [],
  }
  data.features.map(feature => {
    if (feature.geometry.type !== 'Polygon') {
      errorStack.nonPolygon.push({ type: feature.geometry.type, id: feature.properties.id })
    }
    if (feature.geometry.coordinates.length > 1) {
      errorStack.enclavePolygon.push({ nbPaths: feature.geometry.coordinates.length, id: feature.properties.id })
    }
    feature.geometry.coordinates[0].map((point, idx) => {
      feature.geometry.coordinates[0].map((point2, idx2) => {
        if (idx !== idx2 && arePointsEqual(point, point2)) {
          errorStack.multiPointPolygon.push({ point, id: feature.properties.id })
        }
      })
    })
  })

  if (Object.keys(errorStack).some(type => errorStack[type].length > 0)) {
    console.log('Pre-conversion analysis found non-supported configs in input data')
    if (errorStack.nonPolygon.length > 0) {
      console.log(errors.nonPolygon);
      console.log(`Analysis found ${errorStack.nonPolygon.length} non polygon features:`)
      errorStack.nonPolygon.map(err => {
        console.log(`Feature of id ${err.id} is a ${err.type}`)
      })
    }
    if (errorStack.enclavePolygon.length > 0) {
      console.log(errors.enclavePolygon);
      console.log(`Analysis found ${errorStack.enclavePolygon.length} enclave polygon features:`)
      errorStack.enclavePolygon.map(err => {
        console.log(`Feature of id ${err.id} has ${err.nbPaths} paths`)
      })
    }

    if (errorStack.multiPointPolygon.length > 0) {
      console.log(errors.multiPointPolygon);
      console.log(`Analysis found ${errorStack.multiPointPolygon.length} multipoints in several features:`)
      const reducedStack = {}
      errorStack.enclavePolygon.map(err => {
        if (!reducedStack[err.id]) {
          reducedStack[err.id] = [err.point];
        } else {
          reducedStack[err.id].push(err.point);
        }
      })
      Object.keys(reducedStack).map(id => {
        console.log(`Feature of id ${id} has ${reducedStack[id].length} points repeated in polygon : ${reducedStack[id]}`)
      })
    }
    return false
  } else {
    console.log('Pre-conversion analysis ran with success')
    return true;
  }
}

//Final function
function split(data, xStart, xEnd, yStart, yEnd, gridSize, bypassAnalysis = false) {
  formatInput(data);
  const isDataOk = bypassAnalysis || inputAnalysis(data);
  if (!isDataOk) {
    console.log('Aborting conversion ...')
    return null;
  }
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

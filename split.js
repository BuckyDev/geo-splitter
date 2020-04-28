var cornerPointMerger = require('./cornerPointMerger').cornerPointMerger

var crossPointNb = require('./pointUtils').crossPointNb
var getPolygonOuterPoint = require('./pointUtils').getPolygonOuterPoint
var isEntryPoint = require('./pointUtils').isEntryPoint
var isBouncePoint = require('./pointUtils').isBouncePoint
var isInSquare = require('./pointUtils').isInSquare
var isInnerCorner = require('./pointUtils').isInnerCorner
var isInCorner = require('./pointUtils').isInCorner

var genArray = require('./utils').genArray
var getSplitPoints = require('./utils').getSplitPoints
var pushArray = require('./utils').pushArray
var mapFrom = require('./utils').mapFrom
var includeArr = require('./utils').includeArr
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
    const topRef = getPolygonOuterPoint(testPoint,polygonPoints,'top');
    const bottomRef = getPolygonOuterPoint(testPoint,polygonPoints,'bottom');
    const leftRef = getPolygonOuterPoint(testPoint,polygonPoints,'left');
    const rightRef = getPolygonOuterPoint(testPoint,polygonPoints,'right');
    
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
function generatePointSubset(minX, maxX, minY, maxY, coordinates) {
  const pointSubset = [];
  coordinates.map(polygonPoints => {
    const start = polygonPoints.findIndex((point, idx) => {
      const prevPoint = polygonPoints[idx === 0 ? polygonPoints.length - 1 : idx - 1]
      const nextPoint = polygonPoints[idx === polygonPoints.length - 1 ? 0 : idx + 1]
      return isEntryPoint(minX, maxX, minY, maxY, point, prevPoint, nextPoint);
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
      const nextPoint = polygonPoints[idx === polygonPoints.length - 1 ? 0 : idx + 1]

      if (isEntryPoint(minX, maxX, minY, maxY, point, prevPoint, nextPoint)) {
        pointSubset.push([point]);
        currentPathIdx++;
      } else if (
        isInCorner(minX, maxX, minY, maxY, point) &&
        !isInnerCorner(minX, maxX, minY, maxY, point, polygonPoints)
      ) {
        return null;
      } else if (
        isInCorner(minX, maxX, minY, maxY, point) &&
        isBouncePoint(minX, maxX, minY, maxY, point, prevPoint, nextPoint) &&
        isInnerCorner(minX, maxX, minY, maxY, point, polygonPoints)
      ) {
        pointSubset.push([point]);
        currentPathIdx++;
      } else if (
        !isInCorner(minX, maxX, minY, maxY, point) &&
        isBouncePoint(minX, maxX, minY, maxY, point, prevPoint, nextPoint)
      ) {
        return null;
      } else if (isInSquare(minX, maxX, minY, maxY, point)) {
        pointSubset[currentPathIdx].push(point);
      }
    })
  })
  return pointSubset;
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

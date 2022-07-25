/**
 * This function creates new points if they are within a polygon
 * and at two gridlines intersections. They will be useful to separate each
 * polygon for this use case
 */

var crossPointNb = require('./pointUtils').crossPointNb
var getPolygonOuterPoint = require('./pointUtils').getPolygonOuterPoint

var genArray = require('./utils').genArray
var includeArr = require('./utils').includeArr
var flattenDoubleArray = require('./utils').flattenDoubleArray


var C = require('./consoleManager').C;
var RUN_STATE = require('./consoleManager').RUN_STATE;


//Generate a collection of points located at an intersection and inside the polygon
function isPointInside(testPoint, feature) {
  const featurePoints = feature.geometry.coordinates;
  return featurePoints.map(polygonPoints => {
    //Only one ref should be enough but two is more reliable (longitude splitting)
    const leftRef = getPolygonOuterPoint(testPoint, polygonPoints, 'left');
    const isInLeft = crossPointNb(testPoint, leftRef, polygonPoints) % 2 === 1;
    if (!isInLeft) { return false };

    const bottomRef = getPolygonOuterPoint(testPoint, polygonPoints, 'bottom');
    const isInBottom = crossPointNb(testPoint, bottomRef, polygonPoints) % 2 === 1;
    if (!isInBottom) { return false };

    return true;
  }).includes(true);
}

function generateCornerPoints(data, xStart, xEnd, yStart, yEnd, gridSize) {
  const pointsToTest = []
  genArray(xStart, xEnd, gridSize).map(x => {
    genArray(yStart, yEnd, gridSize).map(y => {
      pointsToTest.push([x, y])
    })
  })

  C.cornerPoints = RUN_STATE.RUNNING;
  return data.features.map((feature, idx) => {
    const featurePoints = flattenDoubleArray(feature.geometry.coordinates);
    const result = pointsToTest.filter(point =>
      isPointInside(point, feature) &&
      !includeArr(featurePoints, point)
    )
    C.updateRun(idx, data.features.length);
    return result
  }
  )
}

module.exports = {
  isPointInside,
  generateCornerPoints
}

/**
 * TESTED
 * @param {*} coordList
 * Returns the minimum square area in which all the feature points are included
 */
function getCoordBoundary(coordList) {
  const flatCoords = coordList.flat();
  const xList = flatCoords.map(([x]) => x);
  const yList = flatCoords.map(([, y]) => y);

  return {
    xMin: Math.min(...xList),
    xMax: Math.max(...xList),
    yMin: Math.min(...yList),
    yMax: Math.max(...yList),
  };
}

/**
 * TESTED
 * @param {*} coordList
 * @param {*} coordList
 * Returns the minimum square area in which all the feature points are included, rounded up to gridSize
 */
function getGridCoordBoundary(coordList, gridSize) {
  const { xMin, xMax, yMin, yMax } = getCoordBoundary(coordList);

  const xMinGrid = Math.floor(xMin / gridSize) * gridSize;
  const xMaxGrid =
    (Math.floor(xMax / gridSize) + (xMax % gridSize === 0 ? 0 : 1)) * gridSize;
  const yMinGrid = Math.floor(yMin / gridSize) * gridSize;
  const yMaxGrid =
    (Math.floor(yMax / gridSize) + (yMax % gridSize === 0 ? 0 : 1)) * gridSize;

  return {
    xMin: xMinGrid,
    xMax: xMaxGrid,
    yMin: yMinGrid,
    yMax: yMaxGrid,
  };
}

module.exports = { getCoordBoundary, getGridCoordBoundary };

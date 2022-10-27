/**
 * @param {*} coordList
 * Returns the minimum area in which all the feature points are included
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

module.exports = getCoordBoundary;

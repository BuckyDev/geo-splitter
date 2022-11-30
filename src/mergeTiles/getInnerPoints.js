const {
  getCoordBoundary,
} = require("../utils/polygonArrangement/getCoordBoundary");
const { genArray, arePointsEqual } = require("../utils");
const {
  getNextPointByIdx,
} = require("../utils/pointArrangement/getPointFromList");
const { isGridPoint } = require("../utils/pointTypes/gridPoint");

/**
 * @param {*} coordList
 * Returns the list of points that are within the final polygon
 * These are points at the corner of a tile that appear in 4 different sets of coordinates
 */
function getInnerPoints(coordList, gridSize) {
  const coordBoundary = getCoordBoundary(coordList);
  const innerPointsBoundary = {
    xMin: (Math.floor(coordBoundary.xMin / gridSize) + 1) * gridSize,
    xMax: Math.floor(coordBoundary.xMax / gridSize) * gridSize,
    yMin: (Math.floor(coordBoundary.yMin / gridSize) + 1) * gridSize,
    yMax: Math.floor(coordBoundary.yMax / gridSize) * gridSize,
  };
  const xArray = genArray(
    innerPointsBoundary.xMin,
    innerPointsBoundary.xMax,
    gridSize
  );
  const yArray = genArray(
    innerPointsBoundary.yMin,
    innerPointsBoundary.yMax,
    gridSize
  );

  const potentialInnerPoints = [];
  xArray.forEach((xcoord) => {
    yArray.forEach((ycoord) => {
      potentialInnerPoints.push([xcoord, ycoord]);
    });
  });

  // TODO: test updated logic
  const innerPoints = potentialInnerPoints.filter((point) => {
    const stringPoint = JSON.stringify(point);

    return (
      coordList.filter((coords) => {
        if (!JSON.stringify(coords).includes(stringPoint)) {
          return false;
        }
        const pointIdx = coords.findIndex((coord) =>
          arePointsEqual(coord, point)
        );
        const nextPoint = getNextPointByIdx(pointIdx, coords);
        const prevPoint = getNextPointByIdx(pointIdx, coords);

        return (
          isGridPoint(nextPoint, gridSize) && isGridPoint(prevPoint, gridSize)
        );
      }).length >= 4
    );
  });

  return innerPoints;
}

module.exports = getInnerPoints;

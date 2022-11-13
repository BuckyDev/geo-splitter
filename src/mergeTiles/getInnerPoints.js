const {
  getCoordBoundary,
} = require("../utils/polygonArrangement/getCoordBoundary");
const { genArray } = require("../utils");

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

  const stringifiedCoords = coordList.map((coords) => JSON.stringify(coords));

  /* This is an approximation, there could be use cases where it doesn't work in bench tests 
    but that would be very unlikely for real map conversion */
  const innerPoints = potentialInnerPoints.filter((point) => {
    const stringPoint = JSON.stringify(point);
    return (
      stringifiedCoords.filter((stringCoord) =>
        stringCoord.includes(stringPoint)
      ).length >= 4
    );
  });

  return innerPoints;
}

module.exports = getInnerPoints;

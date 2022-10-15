/**
 * This function add points to the polygon set.
 * Each time a line crosses a grid line, a new point is added.
 */

var getSplitPoints = require('./utils').getSplitPoints
var pushArray = require('./utils').pushArray

var C = require('./consoleManager').C;
var RUN_STATE = require('./consoleManager').RUN_STATE;

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
  C.splitPoints = RUN_STATE.RUNNING;
  return data.features.map((feature, idx) => {
    const enrichedCoordinates = addSplitPointFeature(feature.geometry.coordinates, gridSize);
    C.updateRun(idx, data.features.length);
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: enrichedCoordinates
      }
    }
  })
}

module.exports = {
  addSplitPointFeature,
  addSplitPointsAll
}

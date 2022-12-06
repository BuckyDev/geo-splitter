const { getSplitPoints, pushArray } = require("./utils");
const { C, RUN_STATE } = require("./consoleManager");

/**
 * @param {*} coordinates
 * @param {*} gridSize
 * @returns updated coordinates
 *
 * Updates the coordinates of a feature by adding split points to it.
 * Each time a line crosses a grid line, a new point is added.
 */
function addSplitPointFeature(coordinates, gridSize) {
  const updatedCoordinates = [];
  coordinates.map((coordinate) => {
    const result = [];
    coordinate.map((coord1, idx) => {
      if (idx === coordinate.length - 1 && coordinate[idx] === coordinate[0]) {
        return null;
      }
      const coord2 = coordinate[idx + 1] || coordinate[0];
      const extraPoints = getSplitPoints([coord1, coord2], gridSize);

      result.push(coord1);
      pushArray(result, extraPoints);
    });
    updatedCoordinates.push(result);
  });
  return updatedCoordinates;
}

/**
 * @param {*} data
 * @param {*} gridSize
 * @returns updated data
 *
 * Add the split points for a FeatureCollection
 */
function addSplitPointsAll(data, gridSize) {
  C.splitPoints = RUN_STATE.RUNNING;
  return data.features.map((feature, idx) => {
    const enrichedCoordinates = addSplitPointFeature(
      feature.geometry.coordinates,
      gridSize
    );
    C.updateRun(idx, data.features.length);

    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: enrichedCoordinates,
      },
    };
  });
}

module.exports = {
  addSplitPointFeature,
  addSplitPointsAll,
};

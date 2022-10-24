const assembleSegments = require("./mergeTilesUtils/assembleSegments");
const getInnerPoints = require("./mergeTilesUtils/getInnerPoints");
const getSegments = require("./mergeTilesUtils/getSegments");
const { doesSegmentCoverTile } = require("./utils");

/**
 * @param {*} tiles
 * Returns an object of features list grouped by id
 */
function groupFeatures(tiles) {
  const globalFeatureList = tiles.map(({ features }) => features).flat();

  const groupedFeatures = {};

  globalFeatureList.forEach((feature) => {
    const featureId = feature.properties.id;
    if (!groupedFeatures[featureId]) {
      groupedFeatures[featureId] = [feature];
    } else {
      groupedFeatures[featureId].push(feature);
    }
  });

  return groupedFeatures;
}

/**
 * @param {*} featureList
 * Returns a list of coordinates list from a list of features
 */
function extractCoordLists(featureList) {
  return featureList.map((feature) =>
    feature.geometry.coordinates[0].slice(0, -1)
  );
}

/**
 * @param {*} featureList
 * @param {*} gridSize
 * Returns a new feature that is a merge of a list of features
 */
function mergeFeatures(featureList, gridSize) {
  // No need to do the merge process if only one tile contains the whole feature
  if (featureList.length === 1) {
    return featureList[0];
  }
  const coordList = extractCoordLists(featureList);
  const innerPoints = getInnerPoints(coordList, gridSize);

  // Removes any inner tile, i.e segments which describe a polygon that cover the whole tile
  const sanitizedCoordList = coordList.filter(
    (coordArray) => !doesSegmentCoverTile(coordArray, gridSize)
  );

  const segments = sanitizedCoordList
    .map((coordArray) => getSegments(coordArray, innerPoints, gridSize))
    .flat();

  const assembledFeature = assembleSegments(segments);
  return assembledFeature;
}

function mergeTiles(tiles, gridSize) {
  console.log(tiles[0]);
  const groupedFeatures = groupFeatures(tiles);
  const mergedFeatures = Object.keys(groupedFeatures)
    .slice(0, 2) //TODO: make this work for all polygons in the bench test
    .map((key) => {
      const firstFeature = groupedFeatures[key];
      return {
        type: "Feature",
        properties: firstFeature.properties,
        geometry: {
          type: "Polygon",
          coordinates: [mergeFeatures(groupedFeatures[key], gridSize)],
        },
      };
    });

  return tiles;
}

module.exports = {
  mergeTiles,
};

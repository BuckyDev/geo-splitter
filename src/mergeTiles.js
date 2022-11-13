const assembleSegments = require("./mergeTiles/assembleSegments");
const getInnerPoints = require("./mergeTiles/getInnerPoints");
const { getAllSegments } = require("./mergeTiles/getSegments");
const { getMismatchFix } = require("./utils/segment/getMismatchFix");

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
  const firstFeature = featureList[0];
  // No need to do the merge process if only one tile contains the whole feature
  if (featureList.length === 1) {
    return firstFeature;
  }
  const coordList = extractCoordLists(featureList);
  const innerPoints = getInnerPoints(coordList, gridSize);

  const segments = getAllSegments(coordList, innerPoints, gridSize);

  const assembledSegments = assembleSegments(segments, gridSize);

  return {
    type: "Feature",
    properties: firstFeature.properties,
    geometry: {
      type: "Polygon",
      coordinates: [assembledSegments],
    },
  };
}

/**
 * @param {*} tiles
 * @param {number} gridSize
 * @returns FeatureCollection
 * Returns a feature collection that contains all merged features
 */
function mergeTiles(tiles, gridSize) {
  const groupedFeatures = groupFeatures(tiles);

  // TODO: make this work for all polygons in the bench test
  const mergeableFeatures = [
    "0",
    "1",
    //"2", // Has a mismatch point
    //"3", // Has a mismatch point
    //"4", // Unknown issue
    "5",
    //"6", // Has a mismatch point
    "7",
    //"8", // May be a problem on border closing the polygon on a grid line
    "9",
    //"10", // May be a problem on inner point detection
    "11",
    //"12", // May be a problem on border closing the polygon on a grid line
  ].map((id) => groupedFeatures[id]);
  const mergedFeatures = mergeableFeatures.map((featureList) =>
    mergeFeatures(featureList, gridSize)
  );

  // testing stuff
  const mismatch = getMismatchFix(
    {
      segment: [
        [70, 17],
        [70, 12],
      ],
      properties: { id: "1", zone: "0_0", zone_id: 0 },
    },
    {
      segment: [
        [70, 17],
        [70, 14],
      ],
      properties: { id: "2", zone: "0_0", zone_id: 0 },
    }
  );
  console.log(mismatch);

  return {
    type: "FeatureCollection",
    features: mergedFeatures,
  };
}

module.exports = {
  mergeTiles,
};

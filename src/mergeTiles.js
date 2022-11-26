const assembleSegments = require("./mergeTiles/assembleSegments");
const {
  getBorderMismatchSegments,
} = require("./mergeTiles/getBorderMismatchSegments");
const getInnerPoints = require("./mergeTiles/getInnerPoints");
const { getAllSegments } = require("./mergeTiles/getSegments");

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
  const borderMismatchSegments = getBorderMismatchSegments(
    featureList,
    gridSize
  );
  const fullSegmentList = segments.concat(borderMismatchSegments);

  // LOG: Result of extra segments for mismatches
  console.log({ segments, borderMismatchSegments, fullSegmentList });

  const assembledSegments = assembleSegments(fullSegmentList, gridSize);

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

  // TODO: make this work for all polygons in the bench test, then remove
  const mergeableFeatures = [
    // POLYGONS WORKING
    //"0",
    //"1",
    //"5",
    //"6", // Has a mismatch point
    //"7",
    //"9",
    //"11",
    //
    // POLYGONS WITH ISSUES
    "2", // Has a mismatch point
    //"3", // Has a mismatch point
    //"4", // Unknown issue
    //"8", // May be a problem on border closing the polygon on a grid line
    //"10", // May be a problem on inner point detection
    //"12", // May be a problem on border closing the polygon on a grid line
  ].map((id) => groupedFeatures[id]);

  /*   const borderMismatchSanitizedFeatures = mergeableFeatures.map(
    (featureGroup) => fixBorderMismatch(featureGroup, gridSize)
  );
  console.log({ borderMismatchSanitizedFeatures, mergeableFeatures });
 */
  const mergedFeatures = mergeableFeatures.map((featureList) =>
    mergeFeatures(featureList, gridSize)
  );

  return {
    type: "FeatureCollection",
    features: mergedFeatures,
  };
}

module.exports = {
  mergeTiles,
};

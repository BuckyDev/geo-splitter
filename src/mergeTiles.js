const assembleSegments = require("./mergeTiles/assembleSegments");
const {
  getBorderMismatchSegments,
  getGridSegmentList,
} = require("./mergeTiles/getBorderMismatchSegments");
const {
  getBoundaryGridSegmentList,
} = require("./mergeTiles/getGridSegmentList");
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
  /** No need to do the merge process if:
   *  - there is only one feature
   *  - or all features are in the same tile
   */
  if (
    featureList.length === 1 ||
    // TODO: Test this
    featureList.filter(
      (feature) => feature.properties.zone !== featureList[0].properties.zone
    ).length === 0
  ) {
    return featureList;
  }

  // Computes the gridSegments that the merge will happen on
  const coordList = extractCoordLists(featureList);
  const gridSegmentsList = getGridSegmentList(coordList, gridSize);
  const boundaryGridSegmentsList = getBoundaryGridSegmentList(
    coordList,
    gridSize
  );

  /** Merge polygons
   */
  const mergeableCoordList = extractCoordLists(featureList);
  const innerPoints = getInnerPoints(mergeableCoordList, gridSize);

  const segments = getAllSegments(
    mergeableCoordList,
    innerPoints,
    gridSegmentsList,
    boundaryGridSegmentsList,
    gridSize
  );
  const borderMismatchSegments = getBorderMismatchSegments(
    featureList,
    gridSize
  );
  const fullSegmentList = segments.concat(borderMismatchSegments);
  console.log({
    boundaryGridSegmentsList,
    fullSegmentList,
    innerPoints,
  });
  const assembledSegments = assembleSegments(fullSegmentList, gridSize);

  return assembledSegments.map((polygonPath, idx) => ({
    type: "Feature",
    properties: {
      id: firstFeature.properties.id,
      zone: firstFeature.properties.zone, // TODO: change this to be the lowest zone
      zone_id: idx,
    },
    geometry: {
      type: "Polygon",
      coordinates: [polygonPath],
    },
  }));
}

/**
 * @param {*} tiles
 * @param {number} gridSize
 * @returns FeatureCollection
 * Returns a feature collection that contains all merged features
 */
function mergeTiles(tiles, gridSize) {
  const groupedFeatures = groupFeatures(tiles);

  const mergedFeatures = Object.values(groupedFeatures)
    .map((featureList) => mergeFeatures(featureList, gridSize))
    .flat();

  return {
    type: "FeatureCollection",
    features: mergedFeatures,
  };
}

module.exports = {
  mergeTiles,
};

const {
  addSplitPointsAll,
  generateCornerPoints,
  generatePointSubset,
  split,
} = require("./src/splitTiles/split");
const { cornerPointMerger } = require("./src/splitTiles/cornerPointMerger");
const { mergeTiles } = require("./src/mergeTiles");
const { sphericSplit, createSphericGrid } = require("./src/sphericSplit");

module.exports = {
  // Main process functions for splitting
  addSplitPoints: addSplitPointsAll,
  cornerPointMerger,
  generateCornerPoints,
  generatePointSubset,
  split,
  // Main process functions for merging
  mergeTiles,
  // Final function for spheric splitting
  sphericSplit,
  createSphericGrid,
};

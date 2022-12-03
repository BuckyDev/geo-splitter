const { addSplitPointsAll } = require("./src/split");
const { cornerPointMerger } = require("./src/cornerPointMerger");
const { generateCornerPoints } = require("./src/split");
const { generatePointSubset } = require("./src/split");
const { mergeTiles } = require("./src/mergeTiles");
const { split } = require("./src/split");
const { sphericSplit, createSphericGrid } = require("./src/sphericSplit");

module.exports = {
  addSplitPoints: addSplitPointsAll,
  cornerPointMerger,
  generateCornerPoints,
  generatePointSubset,
  mergeTiles,
  split,
  sphericSplit,
  createSphericGrid,
};

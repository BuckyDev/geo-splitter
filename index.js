var addSplitPoints = require("./src/split").addSplitPointsAll;
var cornerPointMerger = require("./src/cornerPointMerger").cornerPointMerger;
var generateCornerPoints = require("./src/split").generateCornerPoints;
var generatePointSubset = require("./src/split").generatePointSubset;
var mergeTiles = require("./src/mergeTiles").mergeTiles;
var split = require("./src/split").split;

module.exports = {
  addSplitPoints,
  cornerPointMerger,
  generateCornerPoints,
  generatePointSubset,
  mergeTiles,
  split,
};

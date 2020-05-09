var addSplitPoints = require('./split.js').addSplitPointsAll
var cornerPointMerger = require('./cornerPointMerger.js').cornerPointMerger
var generateCornerPoints = require('./split.js').generateCornerPoints
var generatePointSubset = require('./split.js').generatePointSubset
var split = require('./split.js').split

module.exports = {
  addSplitPoints,
  cornerPointMerger,
  generateCornerPoints,
  generatePointSubset,
  split,
}

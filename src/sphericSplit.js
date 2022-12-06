const { genArray } = require("./utils/utils");
const { split } = require("./splitTiles/split");
const { mergeTiles } = require("./mergeTiles/mergeTiles");

/**
 * @param {} gridSize
 * @param {} mapHeight
 * @param {} mapWidth
 * @param {} latRatio
 * Returns a group of tiles meant to be merged for spheric pattern
 */
const getTileGroup = ({ currentX, currentTileWidth, currentY, gridSize }) => {
  return genArray(currentX, currentX + currentTileWidth, gridSize)
    .slice(0, -1)
    .map((xCoord) => `${xCoord}_${currentY}`);
};

const MAX_ITERATIONS = 50000;

/**
 * @param {} gridSize
 * @param {} mapHeight
 * @param {} mapWidth
 * @param {} latRatio
 * Checks if the inputs cover the plan perfectly
 */
function isValidSphericGrid({
  gridSize,
  xStart,
  xEnd,
  yStart,
  yEnd,
  latRatio, // The growth rate of tile number
}) {
  const mapHeight = yEnd - yStart;
  const mapWidth = xEnd - xStart;
  /**
   * First, check if the provided mapHeight and mapWidth can be divided by gridSize
   */
  if (mapHeight % gridSize !== 0 || mapWidth % gridSize !== 0) {
    return false;
  }

  /**
   * Then, check if mapWidth/gridSize can be reached with the provided latRatio
   */
  if (mapWidth % (gridSize * 4 * latRatio) !== 0) {
    return false;
  }

  // Config is valid otherwise
  return true;
}

/**
 * @param {} gridSize
 * @param {} mapHeight
 * @param {} mapWidth
 * @param {} latRatio
 * Returns a array of grouped tile ids
 */
function createSphericGrid({
  gridSize,
  xStart,
  xEnd,
  yStart,
  yEnd,
  latRatio, // The growth rate of tile number
}) {
  const mapHeight = yEnd - yStart;
  const mapWidth = xEnd - xStart;
  // Before starting, check the grid pattern is valid
  /* if (
    !isValidSphericGrid({
      gridSize,
      mapHeight,
      mapWidth,
      latRatio, // The growth rate of tile number
    })
  ) {
    console.log("Provided spheric pattern was marked as invalid");
    return [];
  } */

  const transitionIterations = Math.floor(
    Math.log(mapWidth / (4 * gridSize)) / Math.log(latRatio)
  );
  const rowsNumber = mapHeight / gridSize;

  let currentX = xStart;
  let currentY = yStart;
  let currentRow = 0;
  let currentTileWidth = mapWidth / 4;
  const tiles = [];

  let idx = 0;

  while (
    (currentX + currentTileWidth < xEnd || currentY < yEnd) &&
    idx < MAX_ITERATIONS
  ) {
    idx++;
    tiles.push(
      getTileGroup({
        currentX,
        currentTileWidth,
        currentY,
        gridSize,
      })
    );

    // Update values for next iterations
    if (currentX + currentTileWidth >= xEnd) {
      currentX = xStart;
      currentY += gridSize;
      // Compute next currentTileWidth
      if (currentRow < transitionIterations) {
        currentTileWidth /= latRatio;
      } else if (currentRow + 1 >= rowsNumber - transitionIterations) {
        currentTileWidth *= latRatio;
      }
      currentRow++;
    } else {
      currentX += currentTileWidth;
    }
  }

  return tiles;
}

function sphericSplit({
  data,
  xStart,
  xEnd,
  yStart,
  yEnd,
  gridSize,
  latRatio,
  bypassAnalysis = true,
}) {
  // Create the orthonormal split
  const orthonormalSplit = split(
    data,
    xStart,
    xEnd,
    yStart,
    yEnd,
    gridSize,
    bypassAnalysis
  );

  // Create the tile groups
  const tileGroups = createSphericGrid({
    gridSize,
    xStart,
    xEnd,
    yStart,
    yEnd,
    latRatio,
  });

  // Merge the tiles by tile groups
  return tileGroups.map((tileGroup) => {
    // Return the tile if there's only one tile in the group
    if (tileGroup.length === 1) {
      return orthonormalSplit.find(
        (tile) => tile.properties.zone === tileGroup[0]
      );
    }
    const tiles = tileGroup.map((tileZone) =>
      orthonormalSplit.find((tile) => tile.properties.zone === tileZone)
    );
    console.log({ tiles, orthonormalSplit, tileGroup });

    return mergeTiles(tiles, gridSize);
  });
}

module.exports = {
  getTileGroup,
  sphericSplit,
  createSphericGrid,
  isValidSphericGrid,
};

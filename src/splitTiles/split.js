const { cornerPointMerger } = require("./cornerPointMerger");
const {
  isSimpleEntryPoint,
  isInSquare,
  isOnSquareSide,
  isInnerCorner,
  isBouncePoint,
  isInCorner,
  areOnSameSide,
  isInjectedEntryPoint,
  isAdjacentEndExt,
  isOnSingleSide,
  setClockwiseRotation,
} = require("../utils/pointUtils");
const {
  genArray,
  mapFrom,
  includeArr,
  arePointsEqual,
  flattenDoubleArray,
} = require("../utils/utils");
const { addSplitPointsAll } = require("./addSplitPoints");
const { generateCornerPoints } = require("./generateCornerPoints");
const { inputAnalysis } = require("../process/inputAnalysis");
const { C, RUN_STATE } = require("../process/consoleManager");

//Generate the subset for a square area
function buildExcludedAdjacentPathCollection(
  minX,
  maxX,
  minY,
  maxY,
  coordinates
) {
  const collection = [];

  //Build a collection of all adjacent paths except inner bouncing
  coordinates.map((polygonPoints) => {
    //Find point to start roaming
    const start = polygonPoints.findIndex((point, idx) => {
      const prevPoint =
        polygonPoints[idx === 0 ? polygonPoints.length - 1 : idx - 1];
      return isSimpleEntryPoint(minX, maxX, minY, maxY, point, prevPoint);
    });
    if (start === -1) {
      return null;
    }

    //Roam polygonPoints
    mapFrom(polygonPoints, start, (pt, idx) => {
      const point = polygonPoints[idx];
      const prevPoint =
        polygonPoints[idx === 0 ? polygonPoints.length - 1 : idx - 1];
      const nextPoint =
        polygonPoints[idx === polygonPoints.length - 1 ? 0 : idx + 1];

      //Add bounce points
      if (
        isBouncePoint(minX, maxX, minY, maxY, point, prevPoint, nextPoint) &&
        !isInCorner(minX, maxX, minY, maxY, point)
      ) {
        collection.push([point]);
      }
      //Add bounce points in corner which are not relevant
      if (
        isBouncePoint(minX, maxX, minY, maxY, point, prevPoint, nextPoint) &&
        isInCorner(minX, maxX, minY, maxY, point) &&
        !isInnerCorner(minX, maxX, minY, maxY, point, polygonPoints)
      ) {
        collection.push([point]);
      }
      //Add points to last collection path if in an adjacent path, and not first member
      if (
        isOnSquareSide(minX, maxX, minY, maxY, point) &&
        isOnSquareSide(minX, maxX, minY, maxY, prevPoint) &&
        areOnSameSide(point, prevPoint)
      ) {
        collection[collection.length - 1].push(point);
      }
      //Start a new path if first point of a multiple point adjacent path
      if (
        isOnSquareSide(minX, maxX, minY, maxY, point) &&
        isOnSquareSide(minX, maxX, minY, maxY, nextPoint) &&
        areOnSameSide(point, nextPoint) &&
        (!isOnSquareSide(minX, maxX, minY, maxY, prevPoint) ||
          !areOnSameSide(point, prevPoint))
      ) {
        collection.push([point]);
      }
    });
  });

  if (collection.length < 1) {
    return collection;
  }

  //Filter this collection so that it keeps only what should be removed
  const filteredCollection = [];
  collection.map((path) => {
    if (path.length === 1) {
      filteredCollection.push(path);
    } else {
      const polygonPoints =
        coordinates.length === 1
          ? coordinates[0]
          : coordinates.find((polygon) => includeArr(polygon, path[0]));

      const startPointIndex = polygonPoints.findIndex((point) =>
        arePointsEqual(point, path[0])
      );
      const endPointIndex = polygonPoints.findIndex((point) =>
        arePointsEqual(point, path[path.length - 1])
      );

      const startPoint = polygonPoints[startPointIndex];
      const followingStartPoint =
        polygonPoints[
          startPointIndex === 0 ? polygonPoints.length - 1 : startPointIndex - 1
        ];
      const followedStartPoint =
        polygonPoints[
          startPointIndex === polygonPoints.length - 1 ? 0 : startPointIndex + 1
        ];

      const endPoint = polygonPoints[endPointIndex];
      const followingEndPoint =
        polygonPoints[
          endPointIndex === polygonPoints.length - 1 ? 0 : endPointIndex + 1
        ];
      const followedEndPoint =
        polygonPoints[
          endPointIndex === 0 ? polygonPoints.length - 1 : endPointIndex - 1
        ];

      if (
        isInjectedEntryPoint(
          minX,
          maxX,
          minY,
          maxY,
          startPoint,
          followingStartPoint
        ) !==
          isAdjacentEndExt(
            minX,
            maxX,
            minY,
            maxY,
            followedStartPoint,
            startPoint,
            polygonPoints
          ) &&
        isInjectedEntryPoint(
          minX,
          maxX,
          minY,
          maxY,
          endPoint,
          followingEndPoint
        ) !==
          isAdjacentEndExt(
            minX,
            maxX,
            minY,
            maxY,
            followedEndPoint,
            endPoint,
            polygonPoints
          )
      ) {
        if (
          isInjectedEntryPoint(
            minX,
            maxX,
            minY,
            maxY,
            endPoint,
            followingEndPoint
          )
        ) {
          path.splice(path.length - 1, 1);
        }
        if (
          isInjectedEntryPoint(
            minX,
            maxX,
            minY,
            maxY,
            startPoint,
            followingStartPoint
          )
        ) {
          path.splice(0, 1);
        }
        if (path.length > 0) {
          filteredCollection.push(path);
        }
      } else if (isOnSingleSide(path)) {
        if (
          isInCorner(minX, maxX, minY, maxY, endPoint) ||
          isInjectedEntryPoint(
            minX,
            maxX,
            minY,
            maxY,
            endPoint,
            followingEndPoint
          )
        ) {
          path.splice(path.length - 1, 1);
        }
        if (
          isInCorner(minX, maxX, minY, maxY, startPoint) ||
          isInjectedEntryPoint(
            minX,
            maxX,
            minY,
            maxY,
            startPoint,
            followingStartPoint
          )
        ) {
          path.splice(0, 1);
        }
        if (path.length > 0) {
          filteredCollection.push(path);
        }
      }
    }
  });
  return filteredCollection;
}

function removeCollection(pointSubset, adjacentPathToExclude) {
  const pointsToRemove = flattenDoubleArray(adjacentPathToExclude);
  return pointSubset
    .map((path) => path.filter((point) => !includeArr(pointsToRemove, point)))
    .filter((path) => path.length > 0);
}

function generatePointSubset(minX, maxX, minY, maxY, coordinates) {
  const pointSubset = [];
  coordinates.map((polygonPoints) => {
    const start = polygonPoints.findIndex((point, idx) => {
      const prevPoint =
        polygonPoints[idx === 0 ? polygonPoints.length - 1 : idx - 1];
      const nextPoint =
        polygonPoints[idx === polygonPoints.length - 1 ? 0 : idx + 1];
      return isSimpleEntryPoint(
        minX,
        maxX,
        minY,
        maxY,
        point,
        prevPoint,
        nextPoint
      );
    });
    if (start === -1) {
      if (
        polygonPoints.every((point) =>
          isInSquare(minX, maxX, minY, maxY, point)
        )
      ) {
        pointSubset.push(polygonPoints);
      }
      return null;
    }
    let currentPathIdx = -1;

    mapFrom(polygonPoints, start, (pt, idx) => {
      const point = polygonPoints[idx];
      const prevPoint =
        polygonPoints[idx === 0 ? polygonPoints.length - 1 : idx - 1];

      if (isSimpleEntryPoint(minX, maxX, minY, maxY, point, prevPoint)) {
        pointSubset.push([point]);
        currentPathIdx++;
      } else if (isInSquare(minX, maxX, minY, maxY, point)) {
        pointSubset[currentPathIdx].push(point);
      }
    });
  });
  //At this stage, every point included in square area is added

  //Filter all irrelevant paths, subpaths and points
  const adjacentPathToExclude = buildExcludedAdjacentPathCollection(
    minX,
    maxX,
    minY,
    maxY,
    coordinates
  );
  const filteredPointSubset =
    adjacentPathToExclude.length > 0
      ? removeCollection(pointSubset, adjacentPathToExclude)
      : pointSubset;
  return filteredPointSubset;
}

function generateCornerPointsSubset(minX, maxX, minY, maxY, cornerPoints) {
  return cornerPoints.filter((point) =>
    isInSquare(minX, maxX, minY, maxY, point)
  );
}

function buildAreaSplit(
  newData,
  cornerPoints,
  xStart,
  xEnd,
  yStart,
  yEnd,
  gridSize
) {
  const areas = [];
  const areasNb = Math.floor(
    ((xEnd - xStart) * (yEnd - yStart)) / (gridSize * gridSize)
  );
  C.merger = RUN_STATE.RUNNING;
  genArray(xStart, xEnd - gridSize, gridSize).map((x, xIdx) => {
    genArray(yStart, yEnd - gridSize, gridSize).map((y, yIdx) => {
      const newFeatures = [];
      newData.features.map((feature, idx) => {
        const cornerPointSubset = generateCornerPointsSubset(
          x,
          x + gridSize,
          y,
          y + gridSize,
          cornerPoints[idx]
        );
        const pointSubset = generatePointSubset(
          x,
          x + gridSize,
          y,
          y + gridSize,
          feature.geometry.coordinates
        );
        const finalCoordinates = cornerPointMerger(
          x,
          x + gridSize,
          y,
          y + gridSize,
          pointSubset,
          cornerPointSubset,
          feature.geometry.coordinates,
          feature.properties.id
        );
        if (finalCoordinates[0] && finalCoordinates[0].length > 0) {
          finalCoordinates.map((polygonCoords, idx) => {
            setClockwiseRotation(polygonCoords);
            polygonCoords.push(polygonCoords[0]);
            newFeatures.push({
              ...feature,
              properties: {
                ...feature.properties,
                zone: `${x}_${y}`,
                zone_id: idx,
              },
              geometry: {
                ...feature.geometry,
                coordinates: [polygonCoords],
              },
            });
          });
        }
      });
      areas.push({
        ...newData,
        properties: { zone: `${x}_${y}` }, // TODO: Make sure this is safe
        features: newFeatures,
      });
      C.updateRun(yIdx + xIdx * ((yEnd - yStart) / gridSize), areasNb);
    });
  });
  return areas;
}

//Input formatting to ensure function will work.
function formatInput(data) {
  data.features.map((feature) => {
    feature.geometry.coordinates.map((polygonCoord) => {
      if (
        arePointsEqual(polygonCoord[0], polygonCoord[polygonCoord.length - 1])
      ) {
        polygonCoord.splice(0, 1);
      }
    });
  });
}

// Final split function
function split(
  data,
  xStart,
  xEnd,
  yStart,
  yEnd,
  gridSize,
  bypassAnalysis = false
) {
  // Formats the input to match running conditions like aligned points
  formatInput(data);
  C.logState();

  // Runs an analysis on the data to check if the splitting process could go wrong
  if (bypassAnalysis) {
    C.analysis = RUN_STATE.BYPASSED;
    C.logState();
  } else {
    C.analysis = RUN_STATE.STARTED;
    C.logState();
  }
  const isDataOk = bypassAnalysis || inputAnalysis(data);
  if (!isDataOk) {
    console.log("Aborting conversion ...");
    return null;
  }

  // Create and add split points to the data
  C.splitPoints = RUN_STATE.STARTED;
  C.logState();
  const splitPointsData = addSplitPointsAll(data, gridSize);
  const newData = {
    ...data,
    features: splitPointsData,
  };
  C.splitPoints = RUN_STATE.SUCCEEDED;
  C.logState();

  // Computes the corner points
  C.cornerPoints = RUN_STATE.STARTED;
  C.logState();
  const intersectionPoints = generateCornerPoints(
    newData,
    xStart,
    xEnd,
    yStart,
    yEnd,
    gridSize
  );
  C.cornerPoints = RUN_STATE.SUCCEEDED;
  C.logState();

  // Build the split tiles from the previous data
  C.merger = RUN_STATE.STARTED;
  C.logState();
  const splittedData = buildAreaSplit(
    newData,
    intersectionPoints,
    xStart,
    xEnd,
    yStart,
    yEnd,
    gridSize
  );
  C.merger = RUN_STATE.SUCCEEDED;
  C.logState();

  // Ends the conversion
  C.conversionEnded = true;
  C.logState();

  return splittedData;
}

module.exports = {
  split,
  addSplitPointsAll,
  generateCornerPoints,
  generatePointSubset,
};

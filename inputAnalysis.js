/**
 * This function runs an analysis on the input data to detect
 * if the splitting process would fail or return with incorrect data
 */

var arePointsEqual = require('./utils').arePointsEqual
var C = require('./consoleManager').C;
var RUN_STATE = require('./consoleManager').RUN_STATE;

// Pitfalls detection
const errors = {
  nonPolygon: "Split cannot convert non Polygon features yet !",
  enclavePolygon: "Split cannot convert Polygon features with enclaves yet !",
  multiPointPolygon: "Split cannot convert Polygon features that includes same point several time yet!",
}

function inputAnalysis(data) {
  const errorStack = {
    nonPolygon: [],
    enclavePolygon: [],
    multiPointPolygon: [],
  }
  C.analysis = RUN_STATE.RUNNING;

  data.features.map((feature, idx) => {
    if (feature.geometry.type !== 'Polygon') {
      errorStack.nonPolygon.push({ type: feature.geometry.type, id: feature.properties.id })
    }
    if (feature.geometry.coordinates.length > 1) {
      errorStack.enclavePolygon.push({ nbPaths: feature.geometry.coordinates.length, id: feature.properties.id })
    }
    feature.geometry.coordinates[0].map((point, idx) => {
      feature.geometry.coordinates[0].map((point2, idx2) => {
        if (idx !== idx2 && arePointsEqual(point, point2)) {
          errorStack.multiPointPolygon.push({ point, id: feature.properties.id })
        }
      })
    })
    C.updateRun(idx, data.features.length);
  })

  if (Object.keys(errorStack).some(type => errorStack[type].length > 0)) {
    console.log('Pre-conversion analysis found non-supported configs in input data')
    if (errorStack.nonPolygon.length > 0) {
      console.log(errors.nonPolygon);
      console.log(`Analysis found ${errorStack.nonPolygon.length} non polygon features:`)
      errorStack.nonPolygon.map(err => {
        console.log(`Feature of id ${err.id} is a ${err.type}`)
      })
    }
    if (errorStack.enclavePolygon.length > 0) {
      console.log(errors.enclavePolygon);
      console.log(`Analysis found ${errorStack.enclavePolygon.length} enclave polygon features:`)
      errorStack.enclavePolygon.map(err => {
        console.log(`Feature of id ${err.id} has ${err.nbPaths} paths`)
      })
    }

    if (errorStack.multiPointPolygon.length > 0) {
      console.log(errors.multiPointPolygon);
      console.log(`Analysis found ${errorStack.multiPointPolygon.length} multipoints in several features:`)
      const reducedStack = {}
      errorStack.enclavePolygon.map(err => {
        if (!reducedStack[err.id]) {
          reducedStack[err.id] = [err.point];
        } else {
          reducedStack[err.id].push(err.point);
        }
      })
      Object.keys(reducedStack).map(id => {
        console.log(`Feature of id ${id} has ${reducedStack[id].length} points repeated in polygon : ${reducedStack[id]}`)
      })
    }
    return false
  } else {
    console.log('Pre-conversion analysis ran with success')
    return true;
  }
}

module.exports = {
  inputAnalysis
}

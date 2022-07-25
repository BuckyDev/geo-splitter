const RUN_STATE = {
  WAITING: 'WAITING',
  STARTED: 'STARTED',
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  BYPASSED: 'BYPASSED',
}

class ConsoleManager {
  constructor() {
    this.analysis = RUN_STATE.WAITING;
    this.splitPoints = RUN_STATE.WAITING;
    this.cornerPoints = RUN_STATE.WAITING;
    this.merger = RUN_STATE.WAITING;

    this.currentStep = 0;
    this.totalSteps = 0;

    this.conversionEnded = false;

    this.errors = {
      splitPoints: [],
      cornerPoints: [],
      merger: []
    }
  }

  logAnalysis() {
    switch (this.analysis) {
      case RUN_STATE.STARTED:
        console.log('Pre-conversion analysis started ...');
        return null;
      case RUN_STATE.RUNNING:
        console.log(`Ran analysis on ${this.currentStep}/${this.totalSteps} features`);
        return null;
      case RUN_STATE.SUCCEEDED:
        console.log('Pre-conversion analysis ran with success!');
        return null;
      case RUN_STATE.FAILED:
        console.log('Pre-conversion analysis found non-supported configs in input data');
        return null;
      case RUN_STATE.BYPASSED:
        console.log('Pre-conversion analysis bypassed');
        return null;
      default:
        return null;
    }
  }

  logSplitPoints() {
    switch (this.splitPoints) {
      case RUN_STATE.STARTED:
        console.log('Adding split points data ...');
        return null;
      case RUN_STATE.RUNNING:
        console.log(`Added split points on ${this.currentStep}/${this.totalSteps} features`);
        return null;
      case RUN_STATE.SUCCEEDED:
        console.log('Split points added!');
        return null;
      case RUN_STATE.FAILED:
        console.log('Split points process has faced an unexpected error');
        return null;
      default:
        return null;
    }
  }

  logCornerPoints() {
    switch (this.cornerPoints) {
      case RUN_STATE.STARTED:
        console.log('Generating corner points ...');
        return null;
      case RUN_STATE.RUNNING:
        console.log(`Added corner points on ${this.currentStep}/${this.totalSteps} features`);
        return null;
      case RUN_STATE.SUCCEEDED:
        console.log('Corner points generated!');
        return null;
      case RUN_STATE.FAILED:
        console.log('Corner points process has faced an unexpected error');
        return null;
      default:
        return null;
    }
  }

  logMerger() {
    switch (this.merger) {
      case RUN_STATE.STARTED:
        console.log('Building area split ...');
        return null;
      case RUN_STATE.RUNNING:
        console.log(`Built ${this.currentStep}/${this.totalSteps} areas`);
        return null;
      case RUN_STATE.SUCCEEDED:
        console.log('All areas built!');
        return null;
      case RUN_STATE.FAILED:
        console.log('Building process has faced an unexpected error');
        return null;
      default:
        return null;
    }
  }

  updateRun(currentStep, totalSteps) {
    this.currentStep = currentStep
    this.totalSteps = totalSteps
    this.logState()
  }

  logErrors() {
    if (this.conversionEnded) {
      if (Object.values(this.errors).every(val => val.length === 0)) {
        console.log('Conversion finished without any error')
      } else {
        console.log('Conversion finished with some errors')
        console.log('Copy-paste the following error codes into geo-splitter-test to get more details about them')
        console.log('')
        Object.keys(this.errors).map(func => {
          this.errors[func].map(err => {
            console.log(`Error code :`)
            console.log(`${JSON.stringify({ function: func, ...err })}`)
            console.log('')
          })
        })
      }
    } else {
      if (Object.values(this.errors).some(val => val.length > 0)) {
        let size = 0;
        Object.values(this.errors).map(errors => { size += errors.length })
        console.log(`Found ${size} error during process`)
      }
    }
  }

  pushErrorStack(calledFunction, type, params, data) {
    this.errors[calledFunction].push({ type, params, data })
  }

  logState() {
    console.clear();
    this.logAnalysis();
    this.logSplitPoints();
    this.logCornerPoints();
    this.logMerger();
    this.logErrors();
  }
}

const C = new ConsoleManager()

module.exports = {
  C,
  RUN_STATE,
}

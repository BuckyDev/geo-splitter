/**
 * This file creates a mather specifially to check for the result of the getAllSegments function
 * It adds nice error display so that it's eventually easier to debug
 */

function formatSegmentsConsoleDisplay(segments) {
  return `[\n  ${segments
    .map((segment, idx) => {
      const isLast = idx === segments.length - 1;
      return `${JSON.stringify(segment)}${isLast ? "" : ","}`;
    })
    .join("\n  ")}\n]`;
}

function toMatchExpectedSegments(segments, expectedSegments) {
  let unexpectedSegment;

  const pass = segments.every((segment) => {
    const isSegmentExpected = expectedSegments.some(
      (expectedSegment) =>
        JSON.stringify(segment) === JSON.stringify(expectedSegment) ||
        JSON.stringify([...segment].reverse()) ===
          JSON.stringify(expectedSegment)
    );
    if (!isSegmentExpected) {
      unexpectedSegment = segment;
    }
    return isSegmentExpected;
  });

  if (pass) {
    return {
      message: () => "expected segments to match expectedSegments",
      pass: true,
    };
  } else {
    return {
      message: () =>
        this.utils.matcherHint(
          "toMatchExpectedSegments",
          undefined,
          undefined,
          {
            comment: "Object.is equality",
            isNot: this.isNot,
            promise: this.promise,
          }
        ) +
        "\n\n" +
        `Expected: ${this.utils.printExpected(
          formatSegmentsConsoleDisplay(expectedSegments)
        )}\n` +
        `Received: ${this.utils.printReceived(
          formatSegmentsConsoleDisplay(segments)
        )}` +
        "\n\n" +
        `Segment ${this.utils.printReceived(
          unexpectedSegment
        )} or reversed version couldn't be found in expectedSegments`,
      pass: false,
    };
  }
}

module.exports = {
  toMatchExpectedSegments,
};

const { describe, expect, test } = require("@jest/globals");
const {
  areSegmentsMismatching,
} = require("../../../../src/utils/segment/areSegmentsMismatching");

describe("areSegmentsMismatching", () => {
  test("returns true if segments have a mismatch point", () => {
    expect(
      areSegmentsMismatching(
        [
          [15, 10],
          [20, 10],
        ],
        [
          [13, 10],
          [20, 10],
        ]
      )
    ).toBe(true);
    expect(
      areSegmentsMismatching(
        [
          [13, 10],
          [20, 10],
        ],
        [
          [15, 10],
          [20, 10],
        ]
      )
    ).toBe(true);
    expect(
      areSegmentsMismatching(
        [
          [10, 15],
          [10, 20],
        ],
        [
          [10, 13],
          [10, 20],
        ]
      )
    ).toBe(true);
    expect(
      areSegmentsMismatching(
        [
          [10, 13],
          [10, 20],
        ],
        [
          [10, 15],
          [10, 20],
        ]
      )
    ).toBe(true);
  });
  test("returns false if segments are equals", () => {
    expect(
      areSegmentsMismatching(
        [
          [15, 10],
          [20, 10],
        ],
        [
          [15, 10],
          [20, 10],
        ]
      )
    ).toBe(false);
    expect(
      areSegmentsMismatching(
        [
          [10, 15],
          [10, 20],
        ],
        [
          [10, 15],
          [10, 20],
        ]
      )
    ).toBe(false);
  });
  test("returns false if segments don't have a mismatch point", () => {
    expect(
      areSegmentsMismatching(
        [
          [15, 10],
          [20, 10],
        ],
        [
          [14, 10],
          [13, 10],
        ]
      )
    ).toBe(false);
    expect(
      areSegmentsMismatching(
        [
          [10, 15],
          [10, 20],
        ],
        [
          [10, 14],
          [10, 13],
        ]
      )
    ).toBe(false);
  });
});

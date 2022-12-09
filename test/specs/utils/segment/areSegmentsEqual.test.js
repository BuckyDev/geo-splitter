const { describe, expect, test } = require("@jest/globals");
const {
  areSegmentsEqual,
} = require("../../../../src/utils/segment/areSegmentsEqual");

describe("areSegmentsEqual", () => {
  test("returns true if segments are equals", () => {
    expect(
      areSegmentsEqual(
        [
          [36, 12],
          [32, 14],
        ],
        [
          [32, 14],
          [36, 12],
        ]
      )
    ).toBe(true);
    expect(
      areSegmentsEqual(
        [
          [36, 12],
          [32, 14],
        ],
        [
          [36, 12],
          [32, 14],
        ]
      )
    ).toBe(true);
  });
  test("returns false if segments are different", () => {
    expect(
      areSegmentsEqual(
        [
          [36, 12],
          [32, 14],
        ],
        [
          [32, 14],
          [36, 13],
        ]
      )
    ).toBe(false);
    expect(
      areSegmentsEqual(
        [
          [36, 12],
          [32, 14],
        ],
        [
          [36, 13],
          [32, 14],
        ]
      )
    ).toBe(false);
    expect(
      areSegmentsEqual(
        [
          [37, 12],
          [32, 14],
        ],
        [
          [32, 14],
          [36, 12],
        ]
      )
    ).toBe(false);
    expect(
      areSegmentsEqual(
        [
          [36, 12],
          [32, 14],
        ],
        [
          [37, 12],
          [32, 14],
        ]
      )
    ).toBe(false);
  });
});

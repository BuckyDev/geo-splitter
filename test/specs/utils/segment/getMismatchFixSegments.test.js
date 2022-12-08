const { describe, expect, test } = require("@jest/globals");
const {
  getMismatchFixSegment,
} = require("../../../../src/utils/segment/getMismatchFixSegment");

describe("getMismatchFixSegment", () => {
  test("returns the right segment for vertical mismatch", () => {
    expect(
      getMismatchFixSegment(
        [
          [70, 12],
          [70, 14],
        ],
        [
          [70, 17],
          [70, 12],
        ]
      )
    ).toEqual([
      [70, 14],
      [70, 17],
    ]);
  });
  test("returns the right segment for horizontal mismatch", () => {
    expect(
      getMismatchFixSegment(
        [
          [90, 20],
          [96, 20],
        ],
        [
          [90, 20],
          [93, 20],
        ]
      )
    ).toEqual([
      [96, 20],
      [93, 20],
    ]);
  });
});

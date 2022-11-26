const {
  getMismatchFixSegment,
} = require("../../../../src/utils/segment/getMismatchFixSegment");

describe("getMismatchFixSegment", () => {
  test("returns the right segment", () => {
    const segment1 = [
      [70, 12],
      [70, 14],
    ];
    const segment2 = [
      [70, 17],
      [70, 12],
    ];
    expect(getMismatchFixSegment(segment1, segment2)).toEqual([
      [70, 14],
      [70, 17],
    ]);
  });
  test("returns the right segment", () => {
    const segment1 = [
      [90, 20],
      [96, 20],
    ];
    const segment2 = [
      [90, 20],
      [93, 20],
    ];
    expect(getMismatchFixSegment(segment1, segment2)).toEqual([
      [96, 20],
      [93, 20],
    ]);
  });
});

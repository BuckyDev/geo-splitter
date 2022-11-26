const {
  getMismatchFix,
} = require("../../../../src/utils/segment/getMismatchFix");

function getMatcher(segment, id) {
  return {
    segment,
    properties: { id, zone: "0_0", zone_id: 0 },
  };
}

describe("getMismatchFix", () => {
  test("returns the right mismatch fix", () => {
    const matcher1 = getMatcher(
      [
        [70, 17],
        [70, 12],
      ],
      "1"
    );
    const matcher2 = getMatcher(
      [
        [70, 17],
        [70, 14],
      ],
      "2"
    );
    expect(getMismatchFix(matcher1, matcher2)).toEqual({
      newPath: [matcher1.segment[0], matcher2.segment[1], matcher1.segment[1]],
      oldSegment: matcher1.segment,
      properties: { id: "1", zone: "0_0", zone_id: 0 },
    });
  });
  test("returns the right mismatch fix with inverted direction", () => {
    const matcher1 = getMatcher(
      [
        [70, 17],
        [70, 12],
      ],
      "1"
    );
    const matcher2 = getMatcher(
      [
        [70, 14],
        [70, 17],
      ],
      "2"
    );
    expect(getMismatchFix(matcher1, matcher2)).toEqual({
      newPath: [matcher1.segment[0], matcher2.segment[0], matcher1.segment[1]],
      oldSegment: matcher1.segment,
      properties: { id: "1", zone: "0_0", zone_id: 0 },
    });
  });
});

const { describe, expect, test } = require("@jest/globals");
const { GRID_SIZE } = require("../../constants/grid");
const {
  getGridSegmentList,
  getBorderSegments,
  getBorderList,
  getBorderMismatch,
} = require("../../../src/mergeTiles/fixBorderMismatch");
const { groupedSample } = require("../../constants/benchTest/groupedSample");

const GENERIC_TEST_COORD = [
  [
    [5, 10],
    [7, 5],
    [13, 4],
    [16, 11],
    [17, 18],
    [21, 24],
    [18, 28],
    [25, 29],
    [27, 34],
    [25, 39],
    [21, 42],
    [16, 45],
    [12, 42],
    [6, 39],
    [5, 32],
    [7, 30],
    [9, 25],
    [8, 20],
    [10, 14],
    [5, 10],
  ],
];
const SINGLE_TILE_TEST_COORD = [
  [
    [53, 23],
    [55, 21],
    [57, 27],
    [53, 28],
  ],
];
const DOUBLE_X_TILE_TEST_COORD = [
  [
    [40, 29],
    [45, 25],
    [42, 22],
    [37, 22],
    [35, 23],
    [38, 24],
    [42, 25],
    [40, 26],
  ],
];
const DOUBLE_Y_TILE_TEST_COORD = [
  [
    [37, 33],
    [34, 28],
    [32, 31],
  ],
];

const GENERIC_EXPECTED_GRID_SEGMENTS = [
  [
    [0, 10],
    [10, 10],
  ],
  [
    [10, 10],
    [20, 10],
  ],
  [
    [20, 10],
    [30, 10],
  ],
  [
    [0, 20],
    [10, 20],
  ],
  [
    [10, 20],
    [20, 20],
  ],
  [
    [20, 20],
    [30, 20],
  ],
  [
    [0, 30],
    [10, 30],
  ],
  [
    [10, 30],
    [20, 30],
  ],
  [
    [20, 30],
    [30, 30],
  ],
  [
    [0, 40],
    [10, 40],
  ],
  [
    [10, 40],
    [20, 40],
  ],
  [
    [20, 40],
    [30, 40],
  ],
  [
    [10, 0],
    [10, 10],
  ],
  [
    [20, 0],
    [20, 10],
  ],
  [
    [10, 10],
    [10, 20],
  ],
  [
    [20, 10],
    [20, 20],
  ],
  [
    [10, 20],
    [10, 30],
  ],
  [
    [20, 20],
    [20, 30],
  ],
  [
    [10, 30],
    [10, 40],
  ],
  [
    [20, 30],
    [20, 40],
  ],
  [
    [10, 40],
    [10, 50],
  ],
  [
    [20, 40],
    [20, 50],
  ],
];
const SINGLE_TILE_GRID_SEGMENTS = [];
const DOUBLE_X_TILE_GRID_SEGMENTS = [
  [
    [40, 20],
    [40, 30],
  ],
];
const DOUBLE_Y_TILE_GRID_SEGMENTS = [
  [
    [30, 30],
    [40, 30],
  ],
];

const HORIZONTAL_GRID_SEGMENT = [
  [10, 20],
  [20, 20],
];
const VERTICAL_GRID_SEGMENT = [
  [20, 10],
  [20, 20],
];

describe("fixBorderMismatch", () => {
  describe("getGridSegmentList", () => {
    function runGetGridSegmentListTest(coordList, expectedGridSegments) {
      const gridSegmentList = getGridSegmentList(coordList, GRID_SIZE);
      expect(gridSegmentList.length).toBe(expectedGridSegments.length);
      gridSegmentList.forEach((gridSegment) => {
        expect(
          expectedGridSegments.some(
            (expectedSegment) =>
              JSON.stringify(gridSegment) === JSON.stringify(expectedSegment)
          )
        ).toBe(true);
      });
    }
    test("returns the right coord boundary for a random polygon", () => {
      runGetGridSegmentListTest(
        GENERIC_TEST_COORD,
        GENERIC_EXPECTED_GRID_SEGMENTS
      );
    });
    test("returns the right grid coord boundary for a polygon within a single tile", () => {
      runGetGridSegmentListTest(
        SINGLE_TILE_TEST_COORD,
        SINGLE_TILE_GRID_SEGMENTS
      );
    });
    test("returns the right grid coord boundary for a polygon within a 2 horizontal tiles", () => {
      runGetGridSegmentListTest(
        DOUBLE_X_TILE_TEST_COORD,
        DOUBLE_X_TILE_GRID_SEGMENTS
      );
    });
    test("returns the right grid coord boundary for a polygon within a 2 vertical tiles", () => {
      runGetGridSegmentListTest(
        DOUBLE_Y_TILE_TEST_COORD,
        DOUBLE_Y_TILE_GRID_SEGMENTS
      );
    });
  });
  describe("getBorderSegments", () => {
    function runGetBorderSegmentsTest(
      coordArray,
      segment,
      expectedBorderSegments
    ) {
      const borderSegments = getBorderSegments(coordArray, segment, GRID_SIZE);
      expect(borderSegments.length).toBe(borderSegments.length);

      borderSegments.forEach((borderSegment) => {
        expect(
          expectedBorderSegments.some(
            (expectedSegment) =>
              JSON.stringify(borderSegment) === JSON.stringify(expectedSegment)
          )
        ).toBe(true);
      });
    }
    test("returns correct unique border segment on vertical grid segment", () => {
      runGetBorderSegmentsTest(
        [
          [20, 12],
          [20, 16],
          [24, 14],
        ],
        VERTICAL_GRID_SEGMENT,
        [
          [
            [20, 12],
            [20, 16],
          ],
        ]
      );
    });
    test("returns correct unique border segment on horizontal grid segment", () => {
      runGetBorderSegmentsTest(
        [
          [12, 20],
          [16, 20],
          [14, 24],
        ],
        HORIZONTAL_GRID_SEGMENT,
        [
          [
            [12, 20],
            [16, 20],
          ],
        ]
      );
    });
    test("filter bounce points", () => {
      runGetBorderSegmentsTest(
        [
          [22, 12],
          [20, 16],
          [24, 14],
        ],
        VERTICAL_GRID_SEGMENT,
        []
      );
    });
    test("return multiple border segments", () => {
      runGetBorderSegmentsTest(
        [
          [26, 12],
          [20, 12],
          [20, 14],
          [24, 15],
          [20, 16],
          [20, 18],
          [26, 18],
        ],
        VERTICAL_GRID_SEGMENT,
        [
          [
            [20, 12],
            [20, 14],
          ],
          [
            [20, 16],
            [20, 18],
          ],
        ]
      );
    });
  });
  describe("getBorderList", () => {
    test("returns the correct border for a polygon within 2 horizontal tiles (polygon 6)", () => {
      const borderList = getBorderList(
        [
          [
            [70, 10],
            [70, 20],
          ],
        ],
        groupedSample[6],
        GRID_SIZE
      );
      expect(borderList.length).toBeGreaterThan(0);
      expect(borderList[0].borders).toEqual([
        {
          borderSegments: [
            [
              [70, 17],
              [70, 11.8],
            ],
          ],
          properties: { id: "6", zone: "60_10", zone_id: 0 },
        },
        {
          borderSegments: [
            [
              [70, 11.8],
              [70, 14],
            ],
          ],
          properties: { id: "6", zone: "70_10", zone_id: 0 },
        },
      ]);
    });
    test("returns the correct border for a polygon within 2 vertical tiles (polygon 12)", () => {
      const borderList = getBorderList(
        [
          [
            [40, 40],
            [50, 40],
          ],
        ],
        groupedSample[12],
        GRID_SIZE
      );
      expect(borderList.length).toBeGreaterThan(0);
      expect(borderList[0].borders).toEqual([
        {
          borderSegments: [
            [
              [46, 40],
              [50, 40],
            ],
          ],
          properties: { id: "12", zone: "40_30", zone_id: 0 },
        },
        {
          borderSegments: [
            [
              [50, 40],
              [46, 40],
            ],
          ],
          properties: { id: "12", zone: "40_40", zone_id: 0 },
        },
      ]);
    });
    test("returns the correct double border for a polygon within 2 vertical tiles (polygon 9)", () => {
      const borderList = getBorderList(
        [
          [
            [20, 10],
            [30, 10],
          ],
        ],
        groupedSample[9],
        GRID_SIZE
      );
      expect(borderList.length).toBeGreaterThan(0);
      expect(borderList[0].borders).toEqual([
        {
          borderSegments: [
            [
              [25, 10],
              [28, 10],
            ],
            [
              [20, 10],
              [23, 10],
            ],
          ],
          properties: { id: "9", zone: "20_0", zone_id: 0 },
        },
        {
          borderSegments: [
            [
              [28, 10],
              [25, 10],
            ],
          ],
          properties: { id: "9", zone: "20_10", zone_id: 0 },
        },
        {
          borderSegments: [
            [
              [23, 10],
              [20, 10],
            ],
          ],
          properties: { id: "9", zone: "20_10", zone_id: 1 },
        },
      ]);
    });
    test("returns the correct borders for polygon 8 type", () => {
      const borderList = getBorderList(
        [
          [
            [40, 20],
            [40, 30],
          ],
        ],
        groupedSample[8],
        GRID_SIZE
      );
      expect(borderList.length).toBeGreaterThan(0);
      expect(borderList[0].borders).toEqual([
        {
          borderSegments: [
            [
              [40, 24.5],
              [40, 22],
            ],
          ],
          properties: { id: "8", zone: "30_20", zone_id: 0 },
        },
        {
          borderSegments: [
            [
              [40, 26],
              [40, 29],
            ],
            [
              [40, 22],
              [40, 24.5],
            ],
          ],
          properties: { id: "8", zone: "40_20", zone_id: 0 },
        },
      ]);
    });
  });
  describe("getBorderMismatch", () => {
    test("returns an empty borderMismatch for a polygon within 2 vertical tiles, and matching borders (polygon 5)", () => {
      const borderList = getBorderList(
        [
          [
            [30, 30],
            [40, 30],
          ],
        ],
        groupedSample[5],
        GRID_SIZE
      );
      const borderMismatch = getBorderMismatch(borderList);
      expect(borderMismatch.length).toBe(0);
    });
    test("returns a correct borderMismatch for a polygon within 2 horizontal tiles, and non matching borders (polygon 6)", () => {
      const borderList = getBorderList(
        [
          [
            [70, 10],
            [70, 20],
          ],
        ],
        groupedSample[6],
        GRID_SIZE
      );
      const borderMismatch = getBorderMismatch(borderList);
      expect(borderMismatch.length).toBe(1);
      expect(borderMismatch[0]).toEqual({
        gridSegment: [
          [70, 10],
          [70, 20],
        ],
        borders: [
          {
            borderSegments: [
              [
                [70, 17],
                [70, 11.8],
              ],
            ],
            properties: { id: "6", zone: "60_10", zone_id: 0 },
          },
          {
            borderSegments: [
              [
                [70, 11.8],
                [70, 14],
              ],
            ],
            properties: { id: "6", zone: "70_10", zone_id: 0 },
          },
        ],
        mismatch: [
          {
            newPath: [
              [70, 17],
              [70, 14],
              [70, 11.8],
            ],
            oldSegment: [
              [70, 17],
              [70, 11.8],
            ],
            properties: { id: "6", zone: "60_10", zone_id: 0 },
          },
        ],
      });
    });
  });
});

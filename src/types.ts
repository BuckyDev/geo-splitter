type Coordinate = number;

type Point = [Coordinate, Coordinate];

type Segment = [Point, Point];

type Path = Point[];

type FeatureProperties = { id: string; zone: string; zone_id: number };
type Feature = {
  type: "Feature";
  properties: FeatureProperties;
  geometry: {
    type: string;
    coordinates: Path[];
  };
};

type Border = {
  gridSegment: Segment;
  borders: Array<{
    borderSegments: Segment[];
    properties: FeatureProperties;
  }>;
};

type Mismatch = {
  newPath: Path;
  oldSegment: Segment;
  properties: FeatureProperties;
};

type BorderMismatch = {
  gridSegment: Border["gridSegment"];
  borders: Border["borders"];
  mismatch: Mismatch[];
};

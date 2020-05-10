# geo-splitter
Some utils to split a GeoJSON file only containing Polygon type features into a collection of tiles

V1.0.1 only contains a function adapted to split polygon data

![Example](./Example.png)

## Usage

Install geo-splitter
```
npm install geo-splitter
```

Use in your projects
```javascript
import geojsonSample from './geojsonSample'; //Import your data
import split from 'geo-splitter';

const xStart = 0;
const xEnd = 100;
const yStart = 0;
const yEnd = 50;
const gridSize = 10;
const bypassAnalysis = false; //(Default to false)

const splittedSample = split(geojsonSample, xStart, xEnd, yStart, yEnd, gridSize, bypassAnalysis);
```
Once that ran, splittedSample will contain a collection of files that with polygons in different square areas of gridSize * gridSize

It's recommended not to bypass analysis if you're not sure of you're data format.
Several contexts aren't supported yet, which will be detected by the pre-conversion analysis:

- Cannot convert anything else than Polygon type features (do not support MultiPolygon, Line, Point, ...)
- Cannot reliably convert polygons if they contain enclaves (if you're feature has more than 1 path, that may still have some pitfalls)
- Cannot convert polygons who contain several time the same point (except start and end points)

## Known issues

Conversion will fail if `xStart` or `yStart` aren't divisible by `gridSize`

## Algorithm

The process of splitting can be summarised in 3 main steps:

- Add extra points located add the frontier of 2 areas crossed by a segment of a polygon
- Create a collection of corner points that are strictly inside a polygon
- Assemble new polygons from parts of polygon path included in an area and corner points

## Reliability 

In order to ensure reliability of those functions, another repo has been developed specificly to run tests and ensure every function returns the expected given different geometry contexts. You can clone and run locally [this client](https://github.com/BuckyDev/geo-splitter-test) to check the covered contexts.

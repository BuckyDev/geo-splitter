# geo-splitter
Some utils to split a GeoJSON file into a collection of tiles

V1.0.0 only contains a splitter adapted to split polygon data

![Example](./Example.png)

## Usage

Install geo-splitter
```
npm install geo-splitter
```

Use in your projects
```javascript
import geojsonSample from './geojsonSample';

const xStart = 0;
const xEnd = 100;
const yStart = 0;
const yEnd = 50;
const gridSize = 10;

const splittedSample = split(geojsonSample, xStart, xEnd, yStart, yEnd, gridSize);
```
Once that ran, splittedSample will contain a collection of files that with polygons in different square areas of gridSize * gridSize

## Algorithm

The process of splitting can be summarised in 3 main steps:

- Add extra points located add the frontier of 2 areas crossed by a segment of a polygon
- Create a collection of corner points that are strictly inside a polygon
- Assemble new polygons from parts of polygon path included in an area and corner points

## Reliability 

In order to ensure reliability of those functions, another repo has been developed specificly to run tests and ensure every function returns the expected given different geometry contexts. You can clone and run localy this client there to check the covered contexts

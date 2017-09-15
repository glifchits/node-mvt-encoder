# node-mvt-encoder

A Node.js utility to encode a vector tile schema into a Mapbox vector tile.

## Installation

```sh
npm install mvt-encoder
```

## Notes

* Only tested for Polygon features
* Does not quantize geometry to the tile grid
* Outputs Mapbox vector tile conforming to (at best) version 1 of the spec

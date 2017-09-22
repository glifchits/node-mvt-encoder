# node-mvt-encoder

[![npm](https://img.shields.io/npm/v/mvt-encoder.svg)](https://www.npmjs.com/package/mvt-encoder)
[![Build Status](https://api.travis-ci.org/glifchits/node-mvt-encoder.svg?branch=master)](https://travis-ci.org/glifchits/node-mvt-encoder)

A Node.js utility to encode a vector tile spec into a Mapbox vector tile.

## Installation

```sh
npm install mvt-encoder
```

[node-gdal](https://github.com/naturalatlas/node-gdal) is a dependency of this
project. It requires `gdal` to be installed in your environment:

```sh
apt-get update -y && apt-get install -y libproj-dev gdal-bin
```

## Usage

```js
var tileEncode = require('mvt-encoder');
var VectorTile = require('@mapbox/vector-tile').VectorTile

var tileSpec = [{
  name: 'blocks',
  features: [{
    geometry: "POLYGON ((0 0, 0 1, 1 1, 1 0, 0 0))",
    properties: {
      hello: "world"
    }
  }]
}];

var encoded = tileEncode(tileSpec);
var decoded = new VectorTile(encoded)

console.log(decoded.layers)
// { blocks: VectorTileLayer {...} }
```

## Tile specification

The `tileEncode` function exported in this module takes one parameter: a "tile
spec". This was inspired by Mapzen's
[mapbox-vector-tile](https://github.com/tilezen/mapbox-vector-tile) package.

A **"tile spec"** is an *array* of *"layer specs"*.

a **"layer spec"** is an *object* with the properties:

* **`name`**: the name of the layer (`string`)
* **`features`**: an *array* of *objects* with the properties:
  * **`geometry`**: a *WKT* representation of a feature geometry. Coordinates
    are relative to the tile, scaled in the range [0, 4096)
  * **`properties`**: an *object* with arbitrary key/values.

## Notes

* Only tested for Polygon features
* Does not quantize geometry to the tile grid
* Outputs Mapbox vector tile conforming to (at best) version 1 of the spec

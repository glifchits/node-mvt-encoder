# node-mvt-encoder

A Node.js utility to encode a vector tile schema into a Mapbox vector tile.

## Installation

```sh
npm install mvt-encoder
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

## Notes

* Only tested for Polygon features
* Does not quantize geometry to the tile grid
* Outputs Mapbox vector tile conforming to (at best) version 1 of the spec

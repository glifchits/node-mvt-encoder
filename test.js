var fs = require('fs')
var test = require('tape')
var vt = require('@mapbox/vector-tile')
var Pbf = require('pbf')
var compile = require('pbf/compile')
var schema = require('protocol-buffers-schema')
var proto = schema.parse(fs.readFileSync('vector_tile.proto'))
var Tile = compile(proto).tile

var tileEncode = require('./tileEncoder.js')
// var tileSpec = JSON.parse(fs.readFileSync('./fixtures/alberta-01.json'))
// var tileBuffer = fs.readFileSync('./fixtures/alberta-01.mvt')
// var expectedTile = new vt.VectorTile(new Pbf(tileBuffer))
// var actualTile = new vt.VectorTile(tileEncode(tileSpec))


test('simple test', t => {

  t.plan(4)

  var simpleSpec = [{
    name: 'blocks',
    features: [{
      geometry: "POLYGON ((0 0, 0 1, 1 1, 1 0, 0 0))"
    }]
  }]

  var enc = tileEncode(simpleSpec)
  var tile = new vt.VectorTile(enc)

  // it has 1 layer
  t.equal(Object.keys(tile.layers).length, 1)

  // the layer has 1 feature
  var layer = tile.layers.blocks
  t.equal(layer.length, 1)

  let f = layer.feature(0)

  var coords = f.toGeoJSON(0, 0, 0)['geometry']['coordinates']
  t.ok(coords.length > 0)

  // assert that the geojson features are actual numbers
  t.ok(coords[0].reduce((a, b) => a.concat(b)).every(c => !isNaN(c)))

})

//
// test('tile test', t => {
//
//   t.plan(4)
//
//   // same number of layers
//   t.equal(
//     Object.keys(actualTile.layers).length,
//     Object.keys(expectedTile.layers).length
//   )
//
//   var actualLayer = actualTile.layers.blocks
//   var expectedLayer = expectedTile.layers.blocks
//
//   // same number of features in the `blocks` layer
//   t.equal(
//     actualLayer.length,
//     expectedLayer.length,
//   )
//
//   // assert generated layer has geojson features
//   var actualFeature = actualLayer.feature(0)
//   var expectedFeature = expectedLayer.feature(0)
//   var coords = actualFeature.toGeoJSON(0, 0,0)['geometry']['coordinates']
//   t.ok(coords.length > 0)
//
//   // assert that the geojson features are actual numbers
//   t.ok(coords[0].reduce((a, b) => a.concat(b)).every(c => !isNaN(c)))
//
// })

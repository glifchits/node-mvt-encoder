var fs = require('fs')
var vt = require('@mapbox/vector-tile')
var Pbf = require('pbf')
var test = require('tape')
var tileEncode = require('./tileEncoder.js')


test('test string properties', t => {

  t.plan(3)

  var spec = JSON.parse(fs.readFileSync('./fixtures/tile_with_string.json'))
  var enc = tileEncode(spec)
  var tile = new vt.VectorTile(enc)
  var properties = tile.layers.mytile.feature(0).properties

  t.equal(properties.hello, "world")
  t.equal(properties.name, "world")
  t.equal(properties.test, "wow!")

})


test('test simple geometry', t => {

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

  var coords = f.toGeoJSON(0, 0, 0)['geometry']['coordinates'][0]

  t.equal(coords.length, 5)

  // assert that the geojson features are actual numbers
  t.ok(coords.reduce((a, b) => a.concat(b)).every(c => !isNaN(c)))

})


test('test simple properties', t => {

  t.plan(11)

  var spec = [{
    name: 'blocks',
    features: [{
      geometry: "POLYGON ((0 0, 0 1, 1 1, 1 0, 0 0))",
      properties: {
        hello: 'world',
        is_tile: true,
        feature_id: 1234,
        score: 0.9993253156,
      }
    }]
  }]

  var enc = tileEncode(spec)
  var tile = new vt.VectorTile(enc)

  t.ok('blocks' in tile.layers)

  var layer = tile.layers.blocks
  t.equal(layer.length, 1)

  var feature = layer.feature(0)
  t.ok('properties' in feature)

  var properties = feature.properties
  var expectedProperties = spec[0].features[0].properties

  t.ok('hello' in properties)
  t.equal(properties.hello, expectedProperties.hello)

  t.ok('is_tile' in properties)
  t.equal(properties.is_tile, expectedProperties.is_tile)

  t.ok('feature_id' in properties)
  t.equal(properties.feature_id, expectedProperties.feature_id)

  t.ok('score' in properties)
  t.equal(properties.score, expectedProperties.score)

})


test('test real world geometries', t => {

  t.plan(7)

  var spec = JSON.parse(fs.readFileSync('./fixtures/edmonton.json'))
  var enc = tileEncode(spec)
  var tile = new vt.VectorTile(enc)
  var tileBuffer = fs.readFileSync('./fixtures/edmonton.mvt')
  var expectedTile = new vt.VectorTile(new Pbf(tileBuffer))

  var aLayer = tile.layers.blocks
  var eLayer = expectedTile.layers.blocks

  t.equal(aLayer.length, eLayer.length)

  var aFeat0 = aLayer.feature(305)
  var eFeat0 = eLayer.feature(305)
  t.equal(aFeat0.properties.block_id, eFeat0.properties.block_id)

  var aGeom = aFeat0.loadGeometry()[0]
  var eGeom = eFeat0.loadGeometry()[0]
  t.equal(aGeom.length, eGeom.length)

  t.equal(aGeom[0].x, eGeom[0].x)
  t.equal(aGeom[4].x, eGeom[4].x)
  t.equal(aGeom[5].y, eGeom[5].y)
  t.equal(aGeom[7].y, eGeom[7].y)

})


test('unsupported feature geometry type fails', t => {

  t.plan(1)

  var spec = JSON.parse(fs.readFileSync('./fixtures/invalid-featuregeom.json'))
  const tryEncode = () => tileEncode(spec)

  t.throws(
    tryEncode,
    /feature geometry type MULTIPOLYGON is not supported at this time/
  )

})

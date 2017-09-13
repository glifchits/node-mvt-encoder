var Pbf = require('pbf')
var compile = require('pbf/compile')
var schema = require('protocol-buffers-schema')
var proto = schema.parse(fs.readFileSync('vector_tile.proto'))
var Tile = compile(proto).tile
var tileSpec = JSON.parse(fs.readFileSync('./fixtures/alberta-01.json'))
var tileEncode = require('./tileEncoder.js')

var customPBF = tileEncode(tileSpec)
var customDecoded = Tile.read(customPBF)

var tileBuffer = fs.readFileSync('./fixtures/alberta-01.mvt')
var tilePBF = new Pbf(tileBuffer)
var tilePbfDecoded = Tile.read(tilePBF)


var vt = require('@mapbox/vector-tile')
const tile = new vt.VectorTile(new Pbf(tileBuffer))

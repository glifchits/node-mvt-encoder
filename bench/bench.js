var fs = require('fs')
var path = require('path')
var Benchmark = require('benchmark')
var tileEncode = require('../tileEncoder.js')

var suite = new Benchmark.Suite

var absPath = pth => path.join(__dirname, pth)

var EMPTY_SPEC = JSON.parse(fs.readFileSync(
  absPath('../fixtures/empty_tile.json')
))

var SIMPLE_STRING_SPEC = JSON.parse(fs.readFileSync(
  absPath('../fixtures/tile_with_string.json')
))

var EDMONTON_SPEC = JSON.parse(fs.readFileSync(
  absPath('../fixtures/edmonton.json')
))


suite
.add('Empty tile test', () => {
  var enc = tileEncode(EMPTY_SPEC)
})
.add('Simple string test', () => {
  var enc = tileEncode(SIMPLE_STRING_SPEC)
})
.add('Edmonton encode test', () => {
  var enc = tileEncode(EDMONTON_SPEC)
})
.on('cycle', logCycle)
// run async
.run({ 'async': true })


function logCycle(event) {
  console.log(String(event.target))
}

var fs = require('fs')
var Pbf = require('pbf')
var path = require('path')
var gdal = require('gdal')
var Tile = require('./vector_tile_protobuf.js').tile


const EXTENT = 4096

// these command values are defined in vector_tile.proto
const MOVE_TO = 1
const LINE_TO = 2
const CLOSE_PATH = 7


function zigzagEncode(n) {
  // the signed coordinates need to be zigzag encoded in order to fit in
  // an (unsigned) uint32 array for the protobuf
  return (n << 1) ^ (n >> 31)
}


function encodeCommand(cmd, reps) {
  // enforce that action is always only ever repeated once
  // since its repeated once, 1 is shifted to the left by 3 bits
  return (reps << 3) | cmd
}


function encodeRing(ring) {
  // Params: ring {array<pt>}
  const [firstPoint, ...points] = ring
  // ignore the last point, it is the same as the first point
  const midPoints = points.slice(0, -1)

  let actions = [
    // this is the first action
    encodeCommand(MOVE_TO, 1),
    zigzagEncode(firstPoint.x), zigzagEncode(EXTENT - firstPoint.y)
  ]

  let linesTo = []
  let prevPoint = firstPoint
  midPoints.forEach(point => {
    const dx = point.x - prevPoint.x
    const dy = prevPoint.y - point.y
    linesTo.push([zigzagEncode(dx), zigzagEncode(dy)])
    prevPoint = point
  })

  actions.push(encodeCommand(LINE_TO, linesTo.length))
  linesTo.forEach(movement => actions.push(movement))

  actions.push(encodeCommand(CLOSE_PATH, 1))

  // flatten the actions list; this produces the encoding
  const enc = actions.reduce((x, y) => x.concat(y), [])
  return enc
}


function encodeGeometry(geom) {
  /**
   * Params: {GDAL geometry} geom
   * Returns: {Array<int>} an MVT encoding of the geometry
   */
  // TODO: enforce ring winding order
  let encodedRings = []

  for (let ringIdx = 0; ringIdx < geom.rings.count(); ringIdx++) {
    const ring = geom.rings.get(ringIdx)
    encodedRings.push(encodeRing(ring.points.toArray()))
  }

  // flatten the ring encodings to produce encoding for full geometry
  const encoding = encodedRings.reduce((x, y) => x.concat(y), [])
  return Uint32Array.from(encoding)
}


function encodeFeatures(features) {
  /**
   * Returns: obj with keys, values, features
   */
  let encodedKeys = []
  let encodedValues = []
  let encodedFeatures = []

  let keyMap = {}
  let valMap = {}

  function encodeProperties(properties) {
    if (
      typeof properties === 'undefined' ||
      Object.keys(properties).length === 0
    ) {
      return []
    }
    const keyVals = Object.entries(properties)

    const tagPairs = keyVals.map(entry => {
      const [key, val] = entry

      if (!(key in keyMap)) {
        let keyIdx = (encodedKeys.push(key) - 1)
        keyMap[key] = keyIdx
      }

      if (!(val in valMap)) {
        let valIdx = (encodedValues.push(val) - 1)
        valMap[val] = valIdx
      }

      return [keyMap[key], valMap[val]]
    })

    // encoded tags is the flattened list of tag pairs
    return tagPairs.reduce((a, b) => a.concat(b))
  }

  function getGeomType(geometry) {
    if (geometry.name !== 'POLYGON') {
      const msg = `feature geometry type ${geometry.name}`
      + ` is not supported at this time.`
      throw new Error(msg)
    }
    return Tile.GeomType['Polygon']
    // const geomType = {
    //   'POLYGON': 'Polygon',
    //   'POINT': 'Point',
    //   'LINESTRING': 'LineString',
    // }[geometry.name]
    // if (geomType in Tile.GeomType) {
    //   return Tile.GeomType[geomType]
    // } else {
    //   return Tile.GeomType['Unknown']
    // }
  }

  features.forEach((feature, idx) => {
    const geom = gdal.Geometry.fromWKT(feature.geometry)
    encodedFeatures.push({
      id: idx,
      tags: encodeProperties(feature.properties),
      type: getGeomType(geom),
      geometry: encodeGeometry(geom)
    })
  })

  return {
    keys: encodedKeys,
    values: encodedValues.map(protobufEncodeValue),
    features: encodedFeatures,
  }
}


function protobufEncodeValue(value) {
  switch (typeof value) {
    case "string":
      return { string_value: value }
    case "boolean":
      return { bool_value: value }
    case "number":
      if (Number.isSafeInteger(value)) {
        return { int_value: value }
      } else {
        return { double_value: value }
      }
    default:
      throw new Error(`Value type '${typeof value}' is not yet supported`)
  }
}


function addLayer(layerSpec) {
  const encoded = encodeFeatures(layerSpec.features)
  const { features, keys, values } = encoded
  let layer = {}
  layer.version = 1
  layer.name = layerSpec.name
  layer.features = features
  layer.keys = keys
  layer.values = values
  layer.extent = EXTENT
  return layer
}


function tileEncoder(layerSpecs) {
  /**
   * input: tileSpec {Array<Object>} a list of layers conforming to the tile
   * layer format defined in https://github.com/tilezen/mapbox-vector-tile
   * output: a Mapbox vector tile PBF
   */
   const tileData = { layers: layerSpecs.map(addLayer) }
   let tilePbf = new Pbf()
   Tile.write(tileData, tilePbf)
   tilePbf.finish()
   return tilePbf
}


module.exports = tileEncoder

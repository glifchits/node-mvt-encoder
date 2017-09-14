#!/usr/bin/python

import sys
import json
import mapbox_vector_tile as vt

try:
    fname = sys.argv[1]
except:
    print("no json file provided")
    sys.exit(1)

name, ext = fname.split('.')
if ext != 'json':
    print("file ext is '{}', expected json".format(ext))

with open(fname) as f:
    tile_spec = json.loads(f.read())
    outname = name + '.mvt'
    pbf = vt.encode(tile_spec)
    with open(outname, 'w+') as outf:
        outf.write(pbf)

    print ('wrote vector tile to file {}'.format(outname))


print("done")

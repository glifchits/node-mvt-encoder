#!/usr/bin/python

import sys
import json
from pprint import pprint
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

compare_name = name + '.mvt'
with open(compare_name) as f:
    decoded_tile = vt.decode(f.read())

print("spec:")
pprint(tile_spec)

print("\ndecoded:")
pprint(decoded_tile)

print("done")

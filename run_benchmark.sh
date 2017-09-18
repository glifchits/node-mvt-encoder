DATE=$(date +%Y%m%d)
GITHASH=$(git --git-dir=.git rev-parse HEAD | head -c 8)
FILENAME=bench/benchmark-$DATE-$GITHASH.txt

echo "Running benchmark"

echo "As of: https://github.com/glifchits/node-mvt-encoder/commit/$GITHASH" \
  > $FILENAME
node bench/bench.js >> $FILENAME

echo "Done"

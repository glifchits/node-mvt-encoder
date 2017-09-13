IMG=tileserver-backendnode

docker build -t $IMG .
docker run -it -v $(pwd):/app -p 5000:5000 $IMG bash

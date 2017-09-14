FROM node:8

RUN apt-get update
RUN apt-get install -y python python-pip python-dev
RUN apt-get install -y binutils libproj-dev gdal-bin

RUN pip install mapbox-vector-tile

WORKDIR /app

#!/usr/bin/env bash

set -ex

// data ディレクトリが存在したら削除

if [ -d data ]; then
  rm -rf data
fi

mkdir data

if [ -d dist ]; then
  rm -rf dist
fi

mkdir dist

curl https://nlftp.mlit.go.jp/ksj/gml/data/N03/N03-2021/N03-20210101_GML.zip -o data/local-gov.zip
unzip data/local-gov.zip -d data/
mv data/N03-20210101_GML/N03-21_210101.geojson data/local-gov.geojson
rm -rf data/N03-20210101_GML/ data/local-gov.zip
curl https://raw.githubusercontent.com/geolonia/moj-counts/main/output.json -o data/chiban-counts.json

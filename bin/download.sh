#!/usr/bin/env bash

set -ex

SCRIPT_DIR=$(cd $(dirname $0); pwd)

if [ -d $SCRIPT_DIR/data ]; then
  rm -rf $SCRIPT_DIR/data
fi

if [ -d $SCRIPT_DIR/dist ]; then
  rm -rf $SCRIPT_DIR/dist
fi

mkdir $SCRIPT_DIR/data
mkdir $SCRIPT_DIR/dist

curl https://nlftp.mlit.go.jp/ksj/gml/data/N03/N03-2021/N03-20210101_GML.zip -o $SCRIPT_DIR/data/local-gov.zip
unzip $SCRIPT_DIR/data/local-gov.zip -d $SCRIPT_DIR/data 


#なぜかここで処理が止まる


mv $SCRIPT_DIR/data/N03-20210101_GML/N03-21_210101.geojson $SCRIPT_DIR/data/local-gov.geojson
rm -rf $SCRIPT_DIR/data/N03-20210101_GML/ $SCRIPT_DIR/data/local-gov.zip
curl https://raw.githubusercontent.com/geolonia/moj-counts/main/output.json -o $SCRIPT_DIR/data/chiban-counts.json

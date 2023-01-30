#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const JSONStream = require('JSONStream');
const turf = require('@turf/turf');

const chibanCount = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'chiban-counts.json'), 'utf8'));

const stream = fs.createReadStream(path.join(__dirname, 'data', 'local-gov.geojson'));
const streamWrite = fs.createWriteStream(path.join(__dirname, '..', 'dist', 'chiban-pref.geojson'));

const parser = JSONStream.parse('features.*');

const pref = {}

stream.pipe(parser)
  .on('data', function (data) {

    if (!data.properties.N03_007) {
      return;
    }

    const prefName = data.properties.N03_001;
    const prefCode = data.properties.N03_007.slice(0, 2);

    if (!pref[prefCode]) {
      pref[prefCode] = {
        name: prefName,
        geometries: []
      };
    }

    pref[prefCode].geometries.push(data.geometry.coordinates);

  })
  .on('end', function () {

    const features = [];

    for (let prefCode in pref) {

      // 市区町村のポリゴンを結合
      let turfPolygons = [];
      for (let coordinates of pref[prefCode].geometries) {
        turfPolygons.push(turf.polygon(coordinates));
      }
      const multiPolygon = turf.union(...turfPolygons);


      // ポリゴンを GeoJSON に変換。地番集計データを追加
      const chiban = chibanCount[prefCode];
      features.push({
        type: 'Feature',
        properties: {
          name: pref[prefCode].name,
          code: prefCode,
          chiban_total: chiban.total,
          chiban_ninni_zahyou: chiban.ninni_zahyou,
          chiban_kokyo_zahyou: chiban.kokyo_zahyou,
          chiban_special: chiban.special_chiban,
        },
        geometry: multiPolygon.geometry
      });
    }

    streamWrite.write('{"type":"FeatureCollection","features":[\n');

    let isFirst = true;

    for (const key in features) {
      if (isFirst) {
        isFirst = false;
      } else {
        streamWrite.write(',\n');
      }
      streamWrite.write(JSON.stringify(features[key]));
    }

    streamWrite.write('\n]}');
    streamWrite.end();

    console.log('done');

  })
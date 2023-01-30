#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const JSONStream = require('JSONStream');

const chibanCount = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'chiban-counts.json'), 'utf8'));

const stream = fs.createReadStream(path.join(__dirname, 'data', 'local-gov.geojson'));
const streamWrite = fs.createWriteStream(path.join(__dirname, '..', 'dist', 'chiban-local-gov.geojson'));

const parser = JSONStream.parse('features.*');

const features = [];

stream.pipe(parser)
  .on('data', function (data) {

    if (!data.properties.N03_007) {
      return;
    }

    const name = data.properties.N03_004;
    const name_pref = data.properties.N03_001;
    const prefCode = data.properties.N03_007.slice(0, 2);
    const localGovCode = data.properties.N03_007;
    const chiban = chibanCount[prefCode][localGovCode];

    // 法務省のデータには北方領土が含まれていないので、
    if (!chiban) {
      return;
    }

    const formatted = {
      type: 'Feature',
      geometry: data.geometry,
      properties: {
        name: name,
        name_pref: name_pref,
        code: localGovCode,
        chiban_total: chiban.total,
        chiban_ninni_zahyou: chiban.ninni_zahyou,
        chiban_kokyo_zahyou: chiban.kokyo_zahyou,
        chiban_special: chiban.special_chiban,
      },
    };

    features.push(formatted);

    // 現在処理中の市区町村名を表示
    console.log(`${name_pref} ${name} を処理中`);
  })
  .on('end', function () {

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

  });

import React from 'react';
import chibanJSON from './chiban-count.json';

declare global {
  interface Window {
    geolonia: any;
  }
}

const style = {
  position: 'absolute',
  width: '100vw',
  height: '100vh',
} as React.CSSProperties;

const mapStyleJSON = {
  "version": 8,
  "name": "Chiban Zahyou Style",
  "sources": {
    "jp-pref": {
      "type": "vector",
      "url": "https://cdn.geolonia.com/tiles/japanese-prefectures.json"
    },
    "jp-local-governments": {
      "type": "vector",
      "url": "https://tileserver.geolonia.com/jp-local-governments/tiles.json?key=YOUR-API-KEY"
    }
  },
  "sprite": "https://geoloniamaps.github.io/basic/basic",
  "glyphs": "https://glyphs.geolonia.com/{fontstack}/{range}.pbf",
  "layers": [
    {
      "id": "background",
      "type": "background",
      "paint": {
        "background-color": "#C8C8C8"
      }
    }
  ]
}

const Component = () => {
  const mapContainer = React.useRef(null);

  React.useEffect(() => {
    const map = new window.geolonia.Map({
      container: mapContainer.current,
      zoom: 4,
      center: [140.14, 37.26],
      hash: true,
      style: mapStyleJSON,
    })

    map.on('load', () => {

      for (const prefCode in chibanJSON) {
        // @ts-ignore
        const value = chibanJSON[prefCode];
        const niniZahyouRate = Math.round(value.ninni_zahyou / value.total * 100);
        // const kokyoZahyouRate = Math.round(value.kokyo_zahyou / value.total * 100);

        map.addLayer({
          "id": `prefectures-${prefCode}`,
          "type": "fill",
          "source": "jp-pref",
          "source-layer": "prefectures",
          "filter": ["==", "code", prefCode],
          "paint": {
            "fill-color": [
              "case",
              // 0~25％
              ["<=", niniZahyouRate, 25],
              `#fad647`,
              // 25~50％
              ["<=", niniZahyouRate, 50],
              `#ffcc00`,
              // 50~75％
              ["<=", niniZahyouRate, 75],
              `#f9a824`,
              // 75~100％
              ["<=", niniZahyouRate, 100],
              `#e64919`,
              // それ以外は、#ffffff を返す
              "#000000"
            ],
            "fill-outline-color": "#ffffff",
            "fill-opacity": 0.8
          }
        })
      }

      // レイヤーをホバーすると、ポップアップを表示する
      map.on('click', (e:any) => {
        const features = map.queryRenderedFeatures(e.point);

        if (!features.length) {
          return;
        }

        const {name, code} = features[0].properties;
        // @ts-ignore
        const {ninni_zahyou, kokyo_zahyou, special_chiban, total } = chibanJSON[code];

        const niniZahyouRate = Math.round(ninni_zahyou / total * 100);
        const kokyoZahyouRate = Math.round(kokyo_zahyou / total * 100);

        const popup = new window.geolonia.Popup({ offset: 25 })
          .setLngLat(e.lngLat)
          .setHTML(
            `<div>
              <h3>${name}</h3>
              <ul>
                <li>任意座標: ${niniZahyouRate}%（${ninni_zahyou}件）</li>
                <li>公共座標: ${kokyoZahyouRate}%（${kokyo_zahyou}件）</li>
                <li>特殊な地番: ${special_chiban}件</li>
                <li>合計: ${total}件</li>
              </ul>
              <small>※特殊な地番: 数字以外から始まる地番の集計です。</small>
              <br>
              <small>*小数点以下は四捨五入しています。</small>
            </div>`
          )
          .addTo(map);
      })


    })
  });

  return (
    <>
      <div style={style} ref={mapContainer}/>
    </>
  );
}

export default Component;
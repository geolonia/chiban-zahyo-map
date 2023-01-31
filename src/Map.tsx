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
    })
  });

  return (
    <>
      <div style={style} ref={mapContainer}/>
    </>
  );
}

export default Component;
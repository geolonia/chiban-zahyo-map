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

const legendList: { [key: string]: any } = {
  // 75~100％
  all: {
    label: `75~100%`,
    color: `#e64919`,
  },
  // 50~75％
  threeQuarter: {
    label: `50~75%`,
    color: `#f9a824`,
  },
  // 25~50％
  half: {
    label: `25~50%`,
    color: `#ffcc00`,
  },
  // 0~25％
  quarter: {
    label: `0~25%`,
    color: `#fad647`,
  }
}

const fillColorExpression = (niniZahyouRate: number) => {
  return [
    "case",
    // 0~25％
    ["<=", niniZahyouRate, 25],
    legendList.quarter.color,
    // 25~50％
    ["<=", niniZahyouRate, 50],
    legendList.half.color,
    // 50~75％
    ["<=", niniZahyouRate, 75],
    legendList.threeQuarter.color,
    // 75~100％
    ["<=", niniZahyouRate, 100],
    legendList.all.color,
    // それ以外は、#ffffff を返す
    "#000000"
  ]
}

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

const calcZahyouRate = (zahyou: number, total: number) => {
  return Math.round(zahyou / total * 100);
}

const Component = () => {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const selectRef = React.useRef<HTMLSelectElement>(null);

  React.useEffect(() => {
    const map = new window.geolonia.Map({
      container: mapContainer.current,
      zoom: 5,
      center: [140.14, 37.26],
      style: mapStyleJSON,
    })

    map.on('load', () => {

      for (const prefCode in chibanJSON) {
        // @ts-ignore
        const value = chibanJSON[prefCode];
        const niniZahyouRatePref = calcZahyouRate(value.ninni_zahyou, value.total);

        // 都道府県レイヤーを追加
        map.addLayer({
          "id": `prefectures-${prefCode}`,
          "type": "fill",
          "source": "jp-pref",
          "source-layer": "prefectures",
          "filter": ["==", "code", prefCode],
          "paint": {
            "fill-color": fillColorExpression(niniZahyouRatePref),
            "fill-outline-color": "#ffffff",
            "fill-opacity": 0.8
          }
        })

        for (const key in value) {

          const { ninni_zahyou, total } = value[key];
          const niniZahyouRateCity = calcZahyouRate(ninni_zahyou, total);

          // 数字かどうか判定
          if (isNaN(Number(key))) {
            continue;
          }

          // 市区町村レイヤーを追加
          map.addLayer({
            "id": `city-${key}`,
            "type": "fill",
            "source": "jp-local-governments",
            "source-layer": "jp-local-governments",
            "filter": ["==", "N03_007", key],
            "paint": {
              "fill-color": fillColorExpression(niniZahyouRateCity),
              "fill-outline-color": "#ffffff",
              "fill-opacity": 0.8
            },
            "layout": {
              "visibility": "none"
            }
          })

        }
      }

      // レイヤーの表示切り替え
      if (selectRef && selectRef.current) {
        selectRef.current.addEventListener('change', (e: any) => {
          const value = e.target.value;

          if (value === 'prefecture') {

            for (const prefCode in chibanJSON) {

              map.setLayoutProperty(`prefectures-${prefCode}`, 'visibility', 'visible');

              // @ts-ignore
              for (const key in chibanJSON[prefCode]) {

                if (isNaN(Number(key))) {
                  continue;
                }

                map.setLayoutProperty(`city-${key}`, 'visibility', 'none');
              }
            }

          } else {

            for (const prefCode in chibanJSON) {

              map.setLayoutProperty(`prefectures-${prefCode}`, 'visibility', 'none');

              // @ts-ignore
              for (const key in chibanJSON[prefCode]) {

                if (isNaN(Number(key))) {
                  continue;
                }

                map.setLayoutProperty(`city-${key}`, 'visibility', 'visible');
              }
            }
          }

        })
      }

      map.on('click', (e: any) => {
        const features = map.queryRenderedFeatures(e.point);

        if (!features.length) {
          return;
        }

        const { name, code } = features[0].properties;
        // @ts-ignore
        const { ninni_zahyou, kokyo_zahyou, special_chiban, total } = chibanJSON[code];

        const niniZahyouRate = Math.round(ninni_zahyou / total * 100);
        const kokyoZahyouRate = Math.round(kokyo_zahyou / total * 100);

        new window.geolonia.Popup({ offset: 25 })
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

      map.on('click', (e: any) => {

        const features = map.queryRenderedFeatures(e.point);

        if (!features.length) {
          return;
        }

        const cityCode = features[0].properties.N03_007;
        const cityName = features[0].properties.N03_004;
        const prefCode = features[0].properties.N03_007.slice(0, 2);

        //@ts-ignore
        const { ninni_zahyou, kokyo_zahyou, special_chiban, total } = chibanJSON[prefCode][cityCode];

        const niniZahyouRate = calcZahyouRate(ninni_zahyou, total);
        const kokyoZahyouRate = calcZahyouRate(kokyo_zahyou, total);

        new window.geolonia.Popup({ offset: 25 })
          .setLngLat(e.lngLat)
          .setHTML(
            `<div>
              <h3>${cityName}</h3>
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
      <select ref={selectRef}>
        <option value='prefecture'>都道府県</option>
        <option value='city'>市区町村</option>
      </select>
      <div style={style} ref={mapContainer} />
      <div className='absolute bottom-10 right-5 block max-w-sm p-3 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700' >
        <div className='text-sm'>任意座標割合</div>
        {
          Object.keys(legendList).map((key) => {
            return (
              <div className='flex items-center' key={key}>
                <span className='block h-3 w-8 mr-2' style={{ backgroundColor: legendList[key].color }}></span>
                {legendList[key].label}
              </div>
            )
          })
        }
      </div>
      <div className='absolute bottom-0 right-0 text-xs bg-white p-0.5'>
        <span><a className=' text-blue-600 dark:text-blue-500 hover:underline' href="https://front.geospatial.jp/houmu-chiseki/" target="_blank" rel="noreferrer">「登記所備付データ」（法務省）</a>を加工して作成</span>
        <span><a className=' text-blue-600 dark:text-blue-500 hover:underline' href="https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v3_1.html" target="_blank" rel="noreferrer">「国土数値情報（行政区域データ）」（国土交通省）</a>を加工して作成</span>
      </div>
    </>
  );
}

export default Component;
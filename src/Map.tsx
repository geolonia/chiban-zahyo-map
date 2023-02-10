import React from 'react';
import chibanJSON from './chiban-count.json';

declare global {
  interface Window {
    geolonia: any;
  }
}

const style = {
  position: 'absolute',
  width: '100%',
  height: 'calc(100% - 64px)',
} as React.CSSProperties;

const legendList: { [key: string]: any } = {
  max: {
    color: '#ff0000',
    label: '100%'
  },
  min: {
    color: '#ffffff',
    label: '0%'
  },
}

const fillColorExpression = (zaHyoRate: number) => {
  return [
    "interpolate",
    ["linear"],
    zaHyoRate,
    0,
    legendList.min.color,
    100,
    legendList.max.color
  ]
}

const calcZahyouRate = (zahyou: number, special_chiban: number, total: number) => {

  if (zahyou === 0) {
    return 0;
  }

  return Math.round(zahyou / (total - special_chiban) * 1000)/10;
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const popupContent = (
  name:string,
  kokyoZahyouRate:number,
  niniZahyouRate:number,
  kokyo_zahyou:number,
  ninni_zahyou:number,
  total:number,
  special_chiban:number
  ) => {

  return `<div>
  <h3 class="text-sm font-bold mb-1">${name}</h3>
  <table class="border border-gray-300">
    <tr class="border border-gray-300">
      <th class="border border-r-gray-300 py-1 px-2">公共座標</th>
      <td class="py-1 px-2">${kokyoZahyouRate}%（${formatNumber(kokyo_zahyou)}件）</td>
    </tr>
    <tr class="border border-gray-300">
      <th class="border border-r-gray-300 py-1 px-2">任意座標</th>
      <td class="py-1 px-2">${niniZahyouRate}%（${formatNumber(ninni_zahyou)}件）</td>
    </tr>
    <tr class="border border-gray-300">
      <th class="border border-r-gray-300 py-1 px-2">合計</th>
      <td class="py-1 px-2">${formatNumber(total - special_chiban)}件</td>
    </tr>
  </table>
</div>`
}

const Component = () => {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const selectRef = React.useRef<HTMLSelectElement>(null);

  React.useEffect(() => {
    const map = new window.geolonia.Map({
      container: mapContainer.current,
      zoom: 5,
      center: [140.14, 37.26],
      style: './style.json',
    })

    map.on('load', () => {

      if (!map.getSource('jp-pref')) {
        map.addSource('jp-pref', {
          type: 'vector',
          url: 'https://cdn.geolonia.com/tiles/japanese-prefectures.json'
        });
      }

      if (!map.getSource('jp-local-governments')) {
        map.addSource('jp-local-governments', {
          type: 'vector',
          url: "https://tileserver.geolonia.com/jp-local-governments/tiles.json?key=YOUR-API-KEY",
        });
      }

      for (const prefCode in chibanJSON) {
        // @ts-ignore
        const value = chibanJSON[prefCode];
        const kokyoZahyouRatePref = calcZahyouRate(value.kokyo_zahyou, value.special_chiban, value.total);

        // 都道府県レイヤーを追加
        map.addLayer({
          "id": `prefectures-${prefCode}`,
          "type": "fill",
          "source": "jp-pref",
          "source-layer": "prefectures",
          "filter": ["==", "code", prefCode],
          "paint": {
            "fill-color": fillColorExpression(kokyoZahyouRatePref),
            "fill-outline-color": "#000000"
          }
        },
          'oc-label-town'
        )

        for (const key in value) {

          // 数字かどうか判定
          if (isNaN(Number(key))) {
            continue;
          }

          const { kokyo_zahyou, special_chiban, total } = value[key];
          const kokyoZahyouRateCity = calcZahyouRate(kokyo_zahyou, special_chiban, total);

          // 市区町村レイヤーを追加
          map.addLayer({
            "id": `city-${key}`,
            "type": "fill",
            "source": "jp-local-governments",
            "source-layer": "jp-local-governments",
            "filter": ["==", "N03_007", key],
            "paint": {
              "fill-color": fillColorExpression(kokyoZahyouRateCity),
              "fill-outline-color": "#000000"
            },
            "layout": {
              "visibility": "none"
            }
          },
            'oc-label-town'
          )

        }
      }

      // レイヤーの表示切り替え
      if (selectRef && selectRef.current) {
        selectRef.current.addEventListener('change', (e: any) => {

          const showPrefectures = e.target.value === 'prefecture';

          for (const prefCode in chibanJSON) {
            map.setLayoutProperty(`prefectures-${prefCode}`, 'visibility', showPrefectures ? 'visible' : 'none');
            // @ts-ignore
            for (const key in chibanJSON[prefCode]) {
              if (!isNaN(Number(key))) {
                map.setLayoutProperty(`city-${key}`, 'visibility', showPrefectures ? 'none' : 'visible');
              }
            }
          }
        })
      }

      map.on('click', (e: any) => {

        const features = map.queryRenderedFeatures(e.point);

        if (!features.length || !selectRef || !selectRef.current) {
          return;
        }

        let name, kokyoZahyouRate, niniZahyouRate, kokyo_zahyou, ninni_zahyou, total, special_chiban;

        if (selectRef.current.value === 'prefecture') {

          name = features[0].properties.name;
          const code = features[0].properties.code;

          // データレイヤー以外をクリックした場合は処理を終了
          if (!code) {
            return;
          }

          // @ts-ignore
          ninni_zahyou = chibanJSON[code].ninni_zahyou;
          // @ts-ignore
          kokyo_zahyou = chibanJSON[code].kokyo_zahyou;
          // @ts-ignore
          special_chiban = chibanJSON[code].special_chiban;
          // @ts-ignore
          total = chibanJSON[code].total;
          niniZahyouRate = calcZahyouRate(ninni_zahyou, special_chiban, total)
          kokyoZahyouRate = calcZahyouRate(kokyo_zahyou, special_chiban, total)
          
        } else {

          // データレイヤー以外をクリックした場合は処理を終了
          if (!features[0].properties.N03_007) {
            return;
          }

          name = features[0].properties.N03_004;
          const cityCode = features[0].properties.N03_007;
          const prefCode = features[0].properties.N03_007.slice(0, 2);

          // @ts-ignore
          ninni_zahyou = chibanJSON[prefCode][cityCode].ninni_zahyou;
          // @ts-ignore
          kokyo_zahyou = chibanJSON[prefCode][cityCode].kokyo_zahyou;
          // @ts-ignore
          special_chiban = chibanJSON[prefCode][cityCode].special_chiban;
          // @ts-ignore
          total = chibanJSON[prefCode][cityCode].total;

          niniZahyouRate = calcZahyouRate(ninni_zahyou, special_chiban, total);
          kokyoZahyouRate = calcZahyouRate(kokyo_zahyou, special_chiban, total);
        }

        const popup = popupContent(
          name,
          kokyoZahyouRate,
          niniZahyouRate,
          kokyo_zahyou,
          ninni_zahyou,
          total,
          special_chiban
        )

        new window.geolonia.Popup({ offset: 25 })
          .setLngLat(e.lngLat)
          .setHTML(popup)
          .addTo(map);
      })

    })
  });

  return (
    <>
      <div style={style} ref={mapContainer} />
      <select
        className='absolute top-[75px] right-[50px] z-10 text-[20px] w-[300px] p-0.5 border border-gray-200 rounded-lg shadow hover:bg-gray-100'
        ref={selectRef}>
        <option value='prefecture'>都道府県</option>
        <option value='city'>市区町村</option>
      </select>
      <div className='absolute bottom-10 right-3 block pointer-events-none max-w-sm p-3 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100' >
        <div className='text-sm'>公共座標割合</div>
        <div className='flex items-center'>
          <span className='block h-40 w-8 mr-2' style={{ background: `linear-gradient(${legendList.max.color}, ${legendList.min.color})`}}></span>
          <div className='flex flex-col justify-between h-40'>
            {Object.keys(legendList).map((key) => {
              return (
                <div className='flex items-center' key={key}>
                  <span>{legendList[key].label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className='absolute bottom-0 py-px px-9 text-[8px] text-left  bg-white sm:max-w-lg lg:max-w-none lg:right-[270px] lg:text-[12px] lg:px-2'>
        <span><a className=' text-blue-600 hover:underline' href="https://front.geospatial.jp/houmu-chiseki/" target="_blank" rel="noreferrer">「登記所備付データ」（法務省）</a>を加工して作成（数値以外で始まる地番住所は除外しています）</span>
        <span><a className='text-blue-600 hover:underline' href="https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v3_1.html" target="_blank" rel="noreferrer">「国土数値情報（行政区域データ）」（国土交通省）</a>を加工して作成</span>
      </div>
    </>
  );
}

export default Component;
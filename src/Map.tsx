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

  return Math.round((zahyou / (total - special_chiban)) * 100);
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const createPopupHTML = (popupObj: any) => {

  const { name, data } = popupObj;

  let tableContent = "";
  for (const item of data) {
    tableContent += `<tr class="border border-gray-300">
      <th class="border border-r-gray-300 font-normal py-1 px-2">${item.label}</th>
      <td class="py-1 px-2">${item.value}</td>
    </tr>`
  };

  return `<div>
  <h3 class="text-sm font-bold mb-1">${name}</h3>
  <table class="m-auto min-w-[200px] border border-gray-300">
    ${tableContent}
  </table>
</div>`
}

const currentSelectStyle = (
  areaSelectRef: React.RefObject<HTMLSelectElement>,
  dataSelectRef: React.RefObject<HTMLSelectElement>
) => {

  if (
    areaSelectRef && areaSelectRef.current &&
    dataSelectRef && dataSelectRef.current
  ) {
    return {
      area: areaSelectRef.current.value,
      data: dataSelectRef.current.value
    }
  }
}

const Component = () => {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const areaSelectRef = React.useRef<HTMLSelectElement>(null);
  const dataSelectRef = React.useRef<HTMLSelectElement>(null);

  React.useEffect(() => {
    const map = new window.geolonia.Map({
      container: mapContainer.current,
      zoom: 5,
      center: [140.14, 37.26],
      style: './style.json',
      hash: true,
    })

    map.once('load', () => {

      for (const prefCode in chibanJSON) {
        // @ts-ignore
        const value = chibanJSON[prefCode];
        const kokyoZahyouRatePref = calcZahyouRate(value.kokyo_zahyou, value.special_chiban, value.total);

        if (!map.getLayer(`prefectures-${prefCode}`)) {
          // ?????????????????????????????????
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
        }

        for (const key in value) {

          // ????????????????????????
          if (isNaN(Number(key))) {
            continue;
          }

          const { kokyo_zahyou, special_chiban, total } = value[key];
          const kokyoZahyouRateCity = calcZahyouRate(kokyo_zahyou, special_chiban, total);

          if (!map.getLayer(`city-${key}`)) {
            // ?????????????????????????????????
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
      }

      // ?????????????????????????????????
      if (
        areaSelectRef && areaSelectRef.current &&
        dataSelectRef && dataSelectRef.current
      ) {

        const switchLayer = (e: any) => {

          const select = currentSelectStyle(areaSelectRef, dataSelectRef);

          if (select?.area === 'pref' && select?.data === 'count') {

            map.setLayoutProperty(`chiban-kokyozahyo-area-pref`, 'visibility', 'none');
            map.setLayoutProperty(`chiban-kokyozahyo-area-city`, 'visibility', 'none');

            for (const prefCode in chibanJSON) {
              map.setLayoutProperty(`prefectures-${prefCode}`, 'visibility', 'visible');
              // @ts-ignore
              for (const key in chibanJSON[prefCode]) {
                if (!isNaN(Number(key))) {
                  map.setLayoutProperty(`city-${key}`, 'visibility', 'none');
                }
              }
            }
          } else if (select?.area === 'city' && select?.data === 'count') {

            map.setLayoutProperty(`chiban-kokyozahyo-area-pref`, 'visibility', 'none');
            map.setLayoutProperty(`chiban-kokyozahyo-area-city`, 'visibility', 'none');

            for (const prefCode in chibanJSON) {
              map.setLayoutProperty(`prefectures-${prefCode}`, 'visibility', 'none');
              // @ts-ignore
              for (const key in chibanJSON[prefCode]) {
                if (!isNaN(Number(key))) {
                  map.setLayoutProperty(`city-${key}`, 'visibility', 'visible');
                }
              }
            }
          } else if (select?.area === 'pref' && select?.data === 'area') {

            map.setLayoutProperty(`chiban-kokyozahyo-area-pref`, 'visibility', 'visible');
            map.setLayoutProperty(`chiban-kokyozahyo-area-city`, 'visibility', 'none');

            for (const prefCode in chibanJSON) {
              map.setLayoutProperty(`prefectures-${prefCode}`, 'visibility', 'none');
              // @ts-ignore
              for (const key in chibanJSON[prefCode]) {
                if (!isNaN(Number(key))) {
                  map.setLayoutProperty(`city-${key}`, 'visibility', 'none');
                }
              }
            }
          } else if (select?.area === 'city' && select?.data === 'area') {

            map.setLayoutProperty(`chiban-kokyozahyo-area-pref`, 'visibility', 'none');
            map.setLayoutProperty(`chiban-kokyozahyo-area-city`, 'visibility', 'visible');

            for (const prefCode in chibanJSON) {
              map.setLayoutProperty(`prefectures-${prefCode}`, 'visibility', 'none');
              // @ts-ignore
              for (const key in chibanJSON[prefCode]) {
                if (!isNaN(Number(key))) {
                  map.setLayoutProperty(`city-${key}`, 'visibility', 'none');
                }
              }
            }
          }
        }

        areaSelectRef.current.addEventListener('change', switchLayer);
        dataSelectRef.current.addEventListener('change', switchLayer);

      }

      map.on('click', (e: any) => {

        const features = map.queryRenderedFeatures(e.point);

        if (!features.length || !areaSelectRef || !areaSelectRef.current) {
          return;
        }

        const select = currentSelectStyle(areaSelectRef, dataSelectRef);

        let popupContent: any = {};

        // ???????????????????????????????????????
        if (select?.area === 'pref' && select?.data === 'count') {

          popupContent["name"] = features[0].properties.name;
          const code = features[0].properties.code;

          // ????????????????????????????????????????????????????????????????????????
          if (!code) {
            return;
          }

          // @ts-ignore
          const ninni_zahyou = chibanJSON[code].ninni_zahyou;
          // @ts-ignore
          const kokyo_zahyou = chibanJSON[code].kokyo_zahyou;
          // @ts-ignore
          const special_chiban = chibanJSON[code].special_chiban;
          // @ts-ignore
          const total = chibanJSON[code].total;
          const niniZahyouRate = calcZahyouRate(ninni_zahyou, special_chiban, total)
          const kokyoZahyouRate = calcZahyouRate(kokyo_zahyou, special_chiban, total)

          const popupData = [
            {
              label: '?????????????????????',
              value: `${kokyoZahyouRate}%???${formatNumber(kokyo_zahyou)}??????`
            },
            {
              label: '?????????????????????',
              value: `${niniZahyouRate}%???${formatNumber(ninni_zahyou)}??????`
            },
            {
              label: '??????',
              value: `${formatNumber(total - special_chiban)}???`
            },
          ]

          popupContent["data"] = popupData;

          // ????????????????????????????????????
        } else if (select?.area === 'city' && select?.data === 'count') {

          // ????????????????????????????????????????????????????????????????????????
          if (!features[0].properties.N03_007) {
            return;
          }

          popupContent["name"] = features[0].properties.N03_004;
          const cityCode = features[0].properties.N03_007;
          const prefCode = features[0].properties.N03_007.slice(0, 2);

          // @ts-ignore
          const ninni_zahyou = chibanJSON[prefCode][cityCode].ninni_zahyou;
          // @ts-ignore
          const kokyo_zahyou = chibanJSON[prefCode][cityCode].kokyo_zahyou;
          // @ts-ignore
          const special_chiban = chibanJSON[prefCode][cityCode].special_chiban;
          // @ts-ignore
          const total = chibanJSON[prefCode][cityCode].total;

          const niniZahyouRate = calcZahyouRate(ninni_zahyou, special_chiban, total);
          const kokyoZahyouRate = calcZahyouRate(kokyo_zahyou, special_chiban, total);

          const popupData = [
            {
              label: '?????????????????????',
              value: `${kokyoZahyouRate}%???${formatNumber(kokyo_zahyou)}??????`
            },
            {
              label: '?????????????????????',
              value: `${niniZahyouRate}%???${formatNumber(ninni_zahyou)}??????`
            },
            {
              label: '??????',
              value: `${formatNumber(total - special_chiban)}???`
            },
          ]

          popupContent["data"] = popupData;

        } else if (select?.data === 'area') {

          // ????????????????????????????????????????????????????????????????????????
          if (!features[0].properties.total_area) {
            return;
          }
          popupContent["name"] = features[0].properties.name;
          let { kokyozahyo_area, total_area } = features[0].properties;

          // ????????????????????????????????????0?????????
          if (!kokyozahyo_area) {
            kokyozahyo_area = 0;
          }

          const kokyozahyoAreaRate = Math.round((kokyozahyo_area / total_area) * 100)

          const popupData = [
            {
              label: '?????????????????????????????????',
              value: `???${kokyozahyoAreaRate}%`
            },
            {
              label: '??????????????????????????????',
              value: `???${formatNumber(Math.round(kokyozahyo_area))}k???`
            },
            {
              label: '?????????',
              value: `???${formatNumber(Math.round(total_area))}k???`
            },
          ]

          popupContent["data"] = popupData;
        }

        const popupHTML = createPopupHTML(popupContent)

        new window.geolonia.Popup({ offset: 25, maxWidth: 500 })
          .setLngLat(e.lngLat)
          .setHTML(popupHTML)
          .addTo(map);
      })

    })
  }, []);

  return (
    <>
      <div style={style} ref={mapContainer} />
      <select
        className='absolute top-[75px] right-[210px] z-10 text-[20px] w-[150px] p-0.5 border border-gray-200 rounded-lg shadow hover:bg-gray-100'
        ref={areaSelectRef}>
        <option value='pref'>????????????</option>
        <option value='city'>????????????</option>
      </select>
      <select
        className='absolute top-[75px] right-[50px] z-10 text-[20px] w-[150px] p-0.5 border border-gray-200 rounded-lg shadow hover:bg-gray-100'
        ref={dataSelectRef}
      >
        <option value='count'>??????</option>
        <option value='area'>??????</option>
      </select>
      <div className='absolute bottom-10 right-3 block pointer-events-none max-w-sm p-3 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100' >
        <div className='text-sm'>??????????????????</div>
        <div className='flex items-center'>
          <span className='block h-40 w-8 mr-2' style={{ background: `linear-gradient(${legendList.max.color}, ${legendList.min.color})` }}></span>
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
        <span><a className=' text-blue-600 hover:underline' href="https://front.geospatial.jp/houmu-chiseki/" target="_blank" rel="noreferrer">?????????????????????????????????????????????</a>????????????????????????</span>
        <span><a className='text-blue-600 hover:underline' href="https://geolonia.github.io/chiban-kokyozahyo-area/" target="_blank" rel="noreferrer">?????????????????????????????????????????????</a></span>
      </div>
    </>
  );
}

export default Component;
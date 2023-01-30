import React from 'react';
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
  "name": "Basic",
  "metadata": {},
  "sources": {
    "jp-local-governments": {
      "type": "vector",
      "url": "https://tileserver.geolonia.com/jp-local-governments/tiles.json?key=YOUR-API-KEY"
    },
  },
  "sprite": "https://cdn.geolonia.com/sprites/basic",
  "glyphs": "https://glyphs.geolonia.com/{fontstack}/{range}.pbf",
  "layers": [
    {
      "id": "background",
      "type": "background",
      "paint": {
        "background-color": "#fff",
      },
    },
    {
      "id": "geolonia",
      "type": "fill",
      "source": "jp-local-governments",
      "source-layer": "jp-local-governments",
      "paint": {
        "fill-color": "#000",
        "fill-opacity": 0.1,
      },
    },
    {
      "id": "geolonia-outline",
      "type": "line",
      "source": "jp-local-governments",
      "source-layer": "jp-local-governments",
      "paint": {
        "line-color": "#000",
        "line-width": 1,
      },
    },
  ],
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

    })
    
  });

  return (
    <>
      <div style={style} ref={mapContainer}/>
    </>
  );
}

export default Component;
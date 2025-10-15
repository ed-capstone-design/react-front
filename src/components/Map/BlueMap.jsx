import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// 환경변수에서 토큰 가져오기
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

export default function BlueMap() {
  const mapContainer = useRef(null);

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      console.error("Mapbox access token is required");
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/parkyountoug/cmgrtgvle001f01st1m0n40sp", // 네 스타일 ID
      center: [127.06443, 37.25243],
      zoom: 13.25,
    });

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainer}
      className="w-full h-screen fixed inset-0 pointer-events-none"
      style={{
        filter: "hue-rotate(200deg) saturate(1.2)",
        zIndex: -50,
      }}
    />
  );
}
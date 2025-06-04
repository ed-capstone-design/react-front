import React, { useEffect, useRef } from "react";

const KakaoMap = ({ markers = [], width = "100%", height = "400px", style = {} }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    // Kakao Map 스크립트가 이미 로드되어 있다고 가정
    const { kakao } = window;
    if (!kakao) return;

    const mapContainer = mapRef.current;
    if (!mapContainer) return;

    // 기존 map 객체 재사용(인사이트 참고)
    if (!mapInstance.current) {
      const mapOption = {
        center:
          markers.length > 0
            ? new kakao.maps.LatLng(markers[0].lat, markers[0].lng)
            : new kakao.maps.LatLng(37.54699, 127.09598),
        level: 4,
      };
      mapInstance.current = new kakao.maps.Map(mapContainer, mapOption);
    }
    const map = mapInstance.current;

    // 중심 이동
    if (markers.length > 0) {
      map.setCenter(new kakao.maps.LatLng(markers[0].lat, markers[0].lng));
    }

    // 기존 마커 제거
    if (map._customMarkers) {
      map._customMarkers.forEach((m) => m.setMap(null));
    }
    map._customMarkers = [];

    // 마커 추가
    markers.forEach((marker) => {
      const markerPosition = new kakao.maps.LatLng(marker.lat, marker.lng);
      const imageSrc =
        marker.imageSrc ||
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png";
      const imageSize = new kakao.maps.Size(64, 69);
      const imageOption = { offset: new kakao.maps.Point(27, 69) };
      const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
      const kakaoMarker = new kakao.maps.Marker({
        position: markerPosition,
        image: markerImage,
      });
      kakaoMarker.setMap(map);
      map._customMarkers.push(kakaoMarker);
    });
  }, [markers, width, height]);

  return (
    <div
      ref={mapRef}
      style={{ width, height, borderRadius: "16px", overflow: "hidden", ...style }}
    />
  );
};

export default KakaoMap;
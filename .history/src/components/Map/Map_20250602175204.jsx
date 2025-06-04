import React, { useEffect, useRef } from "react";

const KakaoMap = ({ markers = [], width = "100%", height = "400px", style = {} }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Kakao Map 스크립트가 이미 로드되어 있다고 가정
    const { kakao } = window;
    if (!kakao) return;

    const mapContainer = mapRef.current;
    const mapOption = {
      center: new kakao.maps.LatLng(37.54699, 127.09598),
      level: 4,
    };
    const map = new kakao.maps.Map(mapContainer, mapOption);

    markers.forEach((marker) => {
      const markerPosition = new kakao.maps.LatLng(marker.lat, marker.lng);
      const imageSrc = marker.imageSrc || "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png";
      const imageSize = new kakao.maps.Size(64, 69);
      const imageOption = { offset: new kakao.maps.Point(27, 69) };
      const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

      const kakaoMarker = new kakao.maps.Marker({
        position: markerPosition,
        image: markerImage,
      });

      kakaoMarker.setMap(map);
    });
  }, [markers]);

  return (
    <div
      ref={mapRef}
      style={{ width, height, borderRadius: "16px", overflow: "hidden", ...style }}
    />
  );
};

export default KakaoMap;
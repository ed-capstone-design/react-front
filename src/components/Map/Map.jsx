import React, { useEffect, useRef } from "react";

const KakaoMap = ({ markers = [], width = "100%", height = "400px", style = {} }) => {
  const mapRef = useRef(null);
  const mapObj = useRef(null);

  useEffect(() => {
    const kakaoMapKey = process.env.REACT_APP_KAKAO_MAP_API_KEY;
    // 스크립트가 이미 있으면 추가하지 않음
    if (!window.kakao) {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&autoload=false`;
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => {
        window.kakao.maps.load(() => {
          if (mapRef.current) renderMap();
        });
      };
    } else {
      window.kakao.maps.load(() => {
        if (mapRef.current) renderMap();
      });
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (window.kakao && mapObj.current) {
      renderMarkers();
    }
    // eslint-disable-next-line
  }, [markers]);

  const renderMap = () => {
    if (!window.kakao || !mapRef.current) return;
    const { kakao } = window;
    // 마커가 없을 때 기본 좌표 사용
    let centerLat = 37.54699;
    let centerLng = 127.09598;
    if (markers.length > 0) {
      centerLat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
      centerLng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;
    }
    const mapOption = {
      center: new kakao.maps.LatLng(centerLat, centerLng),
      level: 4,
    };
    mapObj.current = new kakao.maps.Map(mapRef.current, mapOption);
    renderMarkers();
  };

  const renderMarkers = () => {
    const { kakao } = window;
    if (!mapObj.current) return;
    // 기존 마커 모두 제거
    if (mapObj.current.markers) {
      mapObj.current.markers.forEach(marker => marker.setMap(null));
    }
    mapObj.current.markers = [];
    if (markers.length === 0) return; // 마커 없으면 아무것도 표시하지 않음
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

      kakaoMarker.setMap(mapObj.current);
      mapObj.current.markers.push(kakaoMarker);
    });
  };

  return (
    <div
      ref={mapRef}
      style={{ width, height, borderRadius: "16px", overflow: "hidden", ...style }}
    />
  );
};

export default KakaoMap;
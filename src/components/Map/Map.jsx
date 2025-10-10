import React, { useEffect, useRef } from "react";

const KakaoMap = ({ markers = [], polyline = [], width = "100%", height = "400px", style = {}, center = null, level = null }) => {
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
      renderPolyline();
      
      // center가 변경되면 지도 중심 이동
      if (center && center.lat && center.lng) {
        const { kakao } = window;
        const newCenter = new kakao.maps.LatLng(center.lat, center.lng);
        mapObj.current.setCenter(newCenter);
        
        // level이 지정되어 있으면 줌 레벨도 변경
        if (level !== null && typeof level === 'number') {
          mapObj.current.setLevel(level);
        }
      }
    }
    // eslint-disable-next-line
  }, [markers, polyline, center, level]);

  const renderMap = () => {
    if (!window.kakao || !mapRef.current) return;
    const { kakao } = window;
    
    // 중심 좌표 결정 (우선순위: props.center > 마커 중심 > 폴리라인 중심 > 기본값)
    let centerLat = 37.54699;
    let centerLng = 127.09598;
    let mapLevel = 4;

    if (center && center.lat && center.lng) {
      // props로 전달된 중심 좌표 사용
      centerLat = center.lat;
      centerLng = center.lng;
    } else if (markers.length > 0) {
      centerLat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
      centerLng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;
    } else if (polyline.length > 0) {
      centerLat = polyline.reduce((sum, p) => sum + p.lat, 0) / polyline.length;
      centerLng = polyline.reduce((sum, p) => sum + p.lng, 0) / polyline.length;
    }

    // 줌 레벨 설정 (props로 전달된 값이 있으면 사용)
    if (level !== null && typeof level === 'number') {
      mapLevel = level;
    }

    const mapOption = {
      center: new kakao.maps.LatLng(centerLat, centerLng),
      level: mapLevel,
    };
    mapObj.current = new kakao.maps.Map(mapRef.current, mapOption);
    renderMarkers();
    renderPolyline();
  };

  const renderMarkers = () => {
    const { kakao } = window;
    if (!mapObj.current) return;
    // 기존 마커/오버레이 모두 제거 (먼저 정리)
    if (mapObj.current.markers) {
      mapObj.current.markers.forEach(marker => marker.setMap(null));
    }
    if (mapObj.current.overlays) {
      mapObj.current.overlays.forEach(ov => ov.setMap(null));
    }
    mapObj.current.markers = [];
    mapObj.current.overlays = [];

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

      // 운전자명/차량번호 오버레이
      if (marker.label || marker.vehicleNumber) {
        const overlayContent = `<div style="background:rgba(255,255,255,0.95);border-radius:8px;padding:2px 8px;font-size:13px;box-shadow:0 1px 4px #0001;white-space:nowrap;">
          <b>${marker.label || ''}</b> <span style="color:#888;">${marker.vehicleNumber || ''}</span>
        </div>`;
        const overlay = new kakao.maps.CustomOverlay({
          position: markerPosition,
          content: overlayContent,
          yAnchor: 1.1
        });
        overlay.setMap(mapObj.current);
        mapObj.current.overlays.push(overlay);
      }
    });
  };

  const renderPolyline = () => {
    const { kakao } = window;
    if (!mapObj.current) return;
    if (mapObj.current.polyline) {
      mapObj.current.polyline.setMap(null);
    }
    if (!polyline || polyline.length < 2) return;
    const linePath = polyline.map(coord => new kakao.maps.LatLng(coord.lat, coord.lng));
    const polylineObj = new kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 5,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.7,
      strokeStyle: 'solid'
    });
    polylineObj.setMap(mapObj.current);
    mapObj.current.polyline = polylineObj;
  };

  return (
    <div
      ref={mapRef}
      style={{ width, height, borderRadius: "16px", overflow: "hidden", ...style }}
    />
  );
};

export default KakaoMap;
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
    // nicer default icons (bus / user) when no explicit imageSrc provided
  const BUS_ICON = 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png';
  const USER_ICON = 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png';

    markers.forEach((marker) => {
      const markerPosition = new kakao.maps.LatLng(marker.lat, marker.lng);

      // Decide image source: explicit imageSrc > kind-based defaults > null
      const kind = marker.kind || marker.type || null; // allow either field
      const imageSrc = marker.imageSrc || (kind === 'bus' ? BUS_ICON : kind === 'user' ? USER_ICON : null);

      if (imageSrc) {
        // existing image marker path (smaller size for cleaner UI)
        const imageSize = new kakao.maps.Size(36, 36);
        const imageOption = { offset: new kakao.maps.Point(18, 36) };
        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

        const kakaoMarker = new kakao.maps.Marker({
          position: markerPosition,
          image: markerImage,
        });
        kakaoMarker.setMap(mapObj.current);
        mapObj.current.markers.push(kakaoMarker);
      } else if (marker.avatar || marker.kind === 'avatar') {
        // render a circular avatar using CustomOverlay for a clean look
        const avatarUrl = marker.avatar || marker.image || null;
        const initials = (marker.label || marker.title || '').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();
        const bgColor = marker.color || '#3b82f6';
        const avatarHtml = avatarUrl ?
          `<div style="width:40px;height:40px;border-radius:50%;overflow:hidden;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.15);background:#fff"><img src=\"${avatarUrl}\" style=\"width:100%;height:100%;object-fit:cover\"/></div>` :
          `<div style=\"width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;background:${bgColor};box-shadow:0 1px 4px rgba(0,0,0,0.15);font-size:14px\">${initials || 'U'}</div>`;

        const overlayContent = `<div style=\"display:flex;flex-direction:column;align-items:center;\">${avatarHtml}</div>`;
        const overlay = new kakao.maps.CustomOverlay({
          position: markerPosition,
          content: overlayContent,
          yAnchor: 1.1
        });
        overlay.setMap(mapObj.current);
        mapObj.current.overlays.push(overlay);
      } else {
        // fallback to a smaller default marker image
        const defaultSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png";
        const imageSize = new kakao.maps.Size(24, 28);
        const imageOption = { offset: new kakao.maps.Point(12, 28) };
        const markerImage = new kakao.maps.MarkerImage(defaultSrc, imageSize, imageOption);
        const kakaoMarker = new kakao.maps.Marker({ position: markerPosition, image: markerImage });
        kakaoMarker.setMap(mapObj.current);
        mapObj.current.markers.push(kakaoMarker);
      }

      // 운전자명/차량번호 오버레이 (label/vehicleNumber 유지)
      if (marker.label || marker.vehicleNumber) {
        // show info under the icon: smaller text, two lines max, and position below marker
        const overlayContent = `
          <div style="background:rgba(255,255,255,0.95);border-radius:6px;padding:4px 6px;font-size:11px;box-shadow:0 1px 6px rgba(0,0,0,0.06);max-width:140px;line-height:1.05;word-break:keep-all;text-align:center;">
            <div style=\"font-weight:700;color:#111;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;\">${marker.label || ''}</div>
            <div style=\"color:#444;font-size:10px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;\">${marker.vehicleNumber || ''}</div>
          </div>`;
        // place overlay below the marker by using a negative yAnchor
        const overlay = new kakao.maps.CustomOverlay({
          position: markerPosition,
          content: overlayContent,
          yAnchor: -0.25
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
      style={{ 
        width: width, 
        height: height,
        minHeight: '300px',
        ...style
      }} 
    />
  );
};

export default KakaoMap;
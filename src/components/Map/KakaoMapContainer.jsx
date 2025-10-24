import React, { useEffect, useRef, useState } from 'react';

const KakaoMapContainer = ({ children, width = '100%', height = '400px', center = { lat: 37.54699, lng: 127.09598 }, level = 4, className = '' }) => {
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const kakaoMapKey = process.env.REACT_APP_KAKAO_MAP_API_KEY;

  useEffect(() => {
    if (!kakaoMapKey) {
      console.error('[KakaoMapContainer] REACT_APP_KAKAO_MAP_API_KEY is not set. Add it to project root .env and restart dev server.');
      return;
    }

    const loadScriptAndInit = () => {
      if (!window.kakao) {
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&autoload=false`;
        script.async = true;
        document.head.appendChild(script);
        script.onload = () => {
          window.kakao.maps.load(() => initMap());
        };
      } else {
        window.kakao.maps.load(() => initMap());
      }
    };

    const initMap = () => {
      if (!mapRef.current) return;
      const { kakao } = window;
      // defensive: ensure center is valid
      let useLat = 37.54699;
      let useLng = 127.09598;
      if (center && Number.isFinite(Number(center.lat)) && Number.isFinite(Number(center.lng))) {
        useLat = Number(center.lat);
        useLng = Number(center.lng);
      }
      const mapOptions = {
        center: new kakao.maps.LatLng(useLat, useLng),
        level: typeof level === 'number' ? level : 4,
      };
      mapObjRef.current = new kakao.maps.Map(mapRef.current, mapOptions);
      setMapReady(true);
    };

    loadScriptAndInit();

    return () => {
      // cleanup: remove all overlays/markers if any were left on map
      try {
        if (mapObjRef.current) {
          if (mapObjRef.current.markers) mapObjRef.current.markers.forEach(m => m.setMap(null));
          if (mapObjRef.current.overlays) mapObjRef.current.overlays.forEach(o => o.setMap(null));
          if (mapObjRef.current.polyline) mapObjRef.current.polyline.setMap(null);
        }
      } catch (e) {
        // swallow cleanup errors
      }
      mapObjRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inject `map` prop into children so child components can use it directly
  const childrenWithMap = React.Children.map(children, (child) => (
    React.isValidElement(child) ? React.cloneElement(child, { map: mapObjRef.current }) : child
  ));

  // If parent later provides a valid center, recenter the map
  useEffect(() => {
    if (!mapObjRef.current || !window.kakao) return;
    const { kakao } = window;
    if (center && Number.isFinite(Number(center.lat)) && Number.isFinite(Number(center.lng))) {
      try {
        const newCenter = new kakao.maps.LatLng(Number(center.lat), Number(center.lng));
        mapObjRef.current.setCenter(newCenter);
      } catch (e) {
        // ignore setCenter errors
      }
    }
  }, [center]);

  // If API key missing, render a helpful box
  if (!kakaoMapKey) {
    return (
      <div style={{ width, height, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, background: '#fff7ed', border: '1px solid #ffedd5', color: '#92400e' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>지도 API 키가 설정되어 있지 않습니다.</div>
          <div style={{ fontSize: 13 }}>프로젝트 루트의 <code>.env</code>에 <code>REACT_APP_KAKAO_MAP_API_KEY=YOUR_KEY</code> 를 추가하세요.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ width, height, position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {/* Render children so they can access map via injected prop */}
      {mapReady && childrenWithMap}
    </div>
  );
};

export default KakaoMapContainer;

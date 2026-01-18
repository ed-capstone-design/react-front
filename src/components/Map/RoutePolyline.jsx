import { useEffect, useRef } from 'react';

const RoutePolyline = ({ map, path = [], color = '#3b82f6' }) => {
  const polyRef = useRef(null);

  useEffect(() => {
    if (!map || !window.kakao) return;
    const { kakao } = window;

    // remove previous
    if (polyRef.current) {
      polyRef.current.setMap(null);
      polyRef.current = null;
    }

    if (!Array.isArray(path) || path.length < 2) return;

    const linePath = path.map(p => new kakao.maps.LatLng(Number(p.lat), Number(p.lng))).filter(Boolean);
    if (linePath.length < 2) return;

    const polyline = new kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 5,
      strokeColor: color,
      strokeOpacity: 0.85,
      strokeStyle: 'solid'
    });
    polyline.setMap(map);
    polyRef.current = polyline;

    // try to set map center to fit polyline bounds (best-effort)
    try {
      const bounds = new kakao.maps.LatLngBounds();
      linePath.forEach(pt => bounds.extend(pt));
      map.setBounds(bounds);
    } catch (e) {
      // ignore
    }

    return () => {
      if (polyRef.current) {
        polyRef.current.setMap(null);
        polyRef.current = null;
      }
    };
  }, [map, JSON.stringify(path), color]);

  return null;
};

export default RoutePolyline;

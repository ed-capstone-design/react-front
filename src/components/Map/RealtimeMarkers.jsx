import React, { useEffect, useRef } from 'react';

const RealtimeMarkers = ({ map, drivers = [] }) => {
  const createdOverlaysRef = useRef([]);

  useEffect(() => {
    if (!map || !window.kakao) return;
    const { kakao } = window;

    // cleanup previous
    createdOverlaysRef.current.forEach(o => o.setMap(null));
    createdOverlaysRef.current = [];

    drivers.forEach(driver => {
      if (!driver || Number.isNaN(Number(driver.lat)) || Number.isNaN(Number(driver.lng))) return;
      const pos = new kakao.maps.LatLng(Number(driver.lat), Number(driver.lng));

      // create avatar overlay
      const avatarUrl = driver.avatar || driver.image;
      const initials = (driver.label || driver.name || '').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();
      const bgColor = driver.color || '#3b82f6';
      const avatarHtml = avatarUrl ?
        `<div style="width:44px;height:44px;border-radius:50%;overflow:hidden;border:3px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.12);background:#fff"><img src=\"${avatarUrl}\" style=\"width:100%;height:100%;object-fit:cover\"/></div>` :
        `<div style=\"width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;background:${bgColor};box-shadow:0 4px 10px rgba(0,0,0,0.12);font-size:14px\">${initials || 'U'}<\/div>`;

      const content = `<div style=\"display:flex;flex-direction:column;align-items:center;gap:4px;\">${avatarHtml}<div style=\"background:rgba(255,255,255,0.95);padding:4px 8px;border-radius:6px;font-size:12px;color:#111;box-shadow:0 1px 4px rgba(0,0,0,0.06);\">${driver.label || driver.name || ''}<\/div><\/div>`;

      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        content,
        yAnchor: 1.2
      });
      overlay.setMap(map);
      createdOverlaysRef.current.push(overlay);
    });

    return () => {
      createdOverlaysRef.current.forEach(o => o.setMap(null));
      createdOverlaysRef.current = [];
    };
  }, [map, drivers]);

  return null;
};

export default RealtimeMarkers;

import React, { useEffect, useRef } from 'react';

const EventMarkers = ({ map, events = [], mode = 'label' }) => {
  const markersRef = useRef([]);
  const overlaysRef = useRef([]);

  // helper: generate an SVG pin with a centered number and return data URL
  const createPinDataUrl = (label, bg = '#1f8ef1', fg = '#ffffff') => {
    const w = 44; // svg width
    const h = 54; // svg height (including tail)
    const circleR = 16;
    const cx = w / 2;
    const cy = 18;
    const fontSize = 14;
    const tailPath = `M ${cx - 8} ${cy + circleR - 2} L ${cx} ${h - 6} L ${cx + 8} ${cy + circleR - 2} Z`;
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <filter id="s" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.25"/></filter>
        </defs>
        <g filter="url(#s)">
          <circle cx="${cx}" cy="${cy}" r="${circleR}" fill="${bg}" stroke="#fff" stroke-width="2" />
          <path d="${tailPath}" fill="${bg}" stroke="#fff" stroke-width="2" />
          <text x="${cx}" y="${cy + (fontSize/3)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" fill="${fg}" font-weight="700">${label}</text>
        </g>
      </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  useEffect(() => {
    if (!map || !window.kakao) return;
    const { kakao } = window;

    // clear previous markers and overlays
    markersRef.current.forEach(m => m.setMap(null));
    overlaysRef.current.forEach(o => o.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];

    events.forEach(ev => {
      if (!ev || Number.isNaN(Number(ev.lat)) || Number.isNaN(Number(ev.lng))) return;
      const pos = new kakao.maps.LatLng(Number(ev.lat), Number(ev.lng));

      if (mode === 'pin') {
        // create an SVG marker image with number inside
        const labelText = ev.label != null ? String(ev.label) : '';
        const dataUrl = createPinDataUrl(labelText || '');
        const imageSize = new kakao.maps.Size(44, 54);
        const imageOption = { offset: new kakao.maps.Point(22, 54) }; // bottom-center anchor
        const markerImage = new kakao.maps.MarkerImage(dataUrl, imageSize, imageOption);
        const marker = new kakao.maps.Marker({ position: pos, image: markerImage });
        marker.setMap(map);
        markersRef.current.push(marker);
      } else {
        // label-only mode: CustomOverlay with plain number badge
        if (ev.label != null) {
          const labelText = String(ev.label);
          const content = `
            <div style="display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#1f8ef1;color:#fff;font-size:12px;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,0.18);border:2px solid #fff;line-height:20px;">
              ${labelText}
            </div>
          `;
          const overlay = new kakao.maps.CustomOverlay({ position: pos, content, yAnchor: 1.0 });
          overlay.setMap(map);
          overlaysRef.current.push(overlay);
        } else {
          const overlay = new kakao.maps.CustomOverlay({ position: pos, content: '<div style="width:0;height:0"></div>', yAnchor: 1.0 });
          overlay.setMap(map);
          overlaysRef.current.push(overlay);
        }
      }
    });

    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      overlaysRef.current.forEach(o => o.setMap(null));
      markersRef.current = [];
      overlaysRef.current = [];
    };
  }, [map, events]);

  return null;
};

export default EventMarkers;

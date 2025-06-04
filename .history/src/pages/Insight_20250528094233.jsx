import React from "react";
import KakaoMap from "../components/Map/Map";

const markerData = [
  { lat: 37.54699, lng: 127.09598, imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png" },
  { lat: 37.55000, lng: 127.10000, imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png" },
];

const Insight = () => (
  <div className="max-w-5xl mx-auto py-10 px-4">
    <h2 className="text-2xl font-bold mb-8 text-gray-900">인사이트</h2>
    <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 운행 지도</h3>
      <KakaoMap markers={markerData} />
    </div>
  </div>
);

export default Insight;
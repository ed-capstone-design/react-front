import React from "react";
import KakaoMap from "../components/KakaoMap";

const markerData = [
  { lat: 37.54699, lng: 127.09598, imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png" },
  { lat: 37.55000, lng: 127.10000, imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png" },
];

const Insight = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">인사이트</h2>
      <div className="bg-white rounded shadow p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">실시간 운행 지도</h3>
        <KakaoMap markers={markerData} />
      </div>
      <div className="bg-white rounded shadow p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">데이터 분석</h3>
        <div className="h-40 flex items-center justify-center text-gray-400">[그래프/통계 영역]</div>
      </div>
      <div className="bg-white rounded shadow p-6">
        <h3 className="text-xl font-bold mb-4">통계</h3>
        <ul className="list-disc pl-6 text-gray-700">
          <li>월별 운행 횟수: 120회</li>
          <li>평균 만족도: 4.7점</li>
          <li>신규 가입자: 30명</li>
        </ul>
      </div>
    </div>
  );
};

export default Insight;
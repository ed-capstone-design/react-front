import React from "react";
import KakaoMap from "../components/Map/Map";
import DriverListPanel from "../components/Driver/DriverListPanel";
import AlertSummaryWidget from "../components/Notification/AlertSummaryWidget";
import { DriverProvider } from "../components/Driver/DriverContext";
import { NotificationProvider } from "../components/Notification/contexts/NotificationContext";

const markerData = [
  { lat: 37.54699, lng: 127.09598, imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png" },
  { lat: 37.55000, lng: 127.10000, imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png" },
];

const Insight = ({ onDriverClick }) => (
  <NotificationProvider>
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">인사이트</h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* 지도 (왼쪽, 메인) */}
        <div className="w-full md:w-[72%] order-1 md:order-1">
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 h-full flex flex-col">
            <div className="flex-1 min-h-[600px]">
              <KakaoMap markers={markerData} />
            </div>
          </div>
        </div>
        {/* 우측 패널 */}
        <div className="w-full md:w-[25%] order-2 md:order-2 space-y-6">
          {/* 운전자 패널 */}
          <DriverProvider>
            <DriverListPanel onDriverClick={onDriverClick} />
          </DriverProvider>
        </div>
      </div>
    </div>
  </NotificationProvider>
);

export default Insight;
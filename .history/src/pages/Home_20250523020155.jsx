import React, { useState } from "react";
import TopNav from "../components/TopNav/TopNav";
import Sidebar from "../components/sidebar/Sidebar"; // 경로 확인: sidebar(소문자)
import InfoCard from "../components/Card/IndoCard";
import Dashboard from "./Dashboard";
import Drivers from "./Drivers";
import OperatingSchedule from "./OperatingSchedule";
import Insight from "./Insight";
import UserDetailPage from "./UserDetailPage";

// menu 배열은 Home에서만 정의하고 Sidebar에는 prop으로 전달하지 마세요!
const menu = [
  { name: "대시보드", key: "dashboard", component: <Dashboard /> },
  { name: "운전자 관리", key: "drivers", component: <Drivers /> },
  { name: "운행 스케줄", key: "operating-schedule", component: <OperatingSchedule /> },
  { name: "인사이트", key: "insight", component: <Insight /> },
  { name: "사용자 상세", key: "userdetailpage", component: <UserDetailPage /> },
];

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected] = useState("dashboard");

  const handleMenuClick = (key) => {
    setSelected(key);
    setSidebarOpen(false);
  };

  const selectedMenu = menu.find((item) => item.key === selected);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 사이드바 */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        position="left"
        selected={selected}
        onMenuClick={handleMenuClick}
      />
      <div className="flex-1">
        <TopNav onSidebarOpen={() => setSidebarOpen(true)} />
        <div className="max-w-5xl mx-auto py-10 px-4">
          <h2 className="text-2xl font-bold mb-6">{selectedMenu?.name || "대시보드"}</h2>
          <div className="flex gap-6 mb-8 flex-wrap">
            <InfoCard title="오늘 방문자" value="1,234명" desc="실시간" />
            <InfoCard title="총 회원수" value="567명" desc="누적" />
            <InfoCard title="신규 가입" value="12명" desc="오늘" />
          </div>
          <div className="bg-white rounded shadow p-6 min-h-[300px]">
            {selectedMenu?.component}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
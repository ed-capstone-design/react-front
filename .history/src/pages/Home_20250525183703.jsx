import React, { useState } from "react";
import TopNav from "../components/TopNav/TopNav";
import Sidebar from "../components/SideBar/SideBar";
import InfoCard from "../components/Card/IndoCard";
import Dashboard from "./Dashboard";
import Drivers from "./Drivers";
import OperatingSchedule from "./OperatingSchedule";
import Insight from "./Insight";

const menu = [
  { name: "대시보드", key: "dashboard", component: <Dashboard /> },
  { name: "운전자 관리", key: "drivers", component: <Drivers /> },
  { name: "운행 스케줄", key: "operating-schedule", component: <OperatingSchedule /> },
  { name: "인사이트", key: "insight", component: <Insight /> }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menu={menu}
        selected={selected}
        onMenuClick={handleMenuClick}
      />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopNav onSidebarOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 max-w-5xl mx-auto py-10 px-4 w-full">
          <h2 className="text-3xl font-extrabold mb-8 text-blue-800 tracking-tight drop-shadow">
            {selectedMenu?.name || "대시보드"}
          </h2>
          {/* 카드 영역 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <InfoCard title="오늘 방문자" value="1,234명" desc="실시간" />
            <InfoCard title="총 회원수" value="567명" desc="누적" />
            <InfoCard title="신규 가입" value="12명" desc="오늘" />
          </div>
          {/* 메인 콘텐츠 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[300px] border border-blue-100">
            {selectedMenu?.component}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
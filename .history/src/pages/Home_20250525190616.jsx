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
  { name: "인사이트", key: "insight", component: <Insight /> },
  { name: "운행상세페이지" }
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
        <TopNav
          onSidebarOpen={() => setSidebarOpen(true)}
          onLogoClick={() => setSelected("dashboard")}
        />
        <main className="flex-1 max-w-5xl mx-auto py-10 px-4 w-full">
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
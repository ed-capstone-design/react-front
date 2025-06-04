import React, { useState } from "react";
import TopNav from "../components//TopNav/TopNav";
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
    <div className="min-h-screen bg-gray-100 flex">
      <div className="flex-1">
        <TopNav onSidebarOpen={() => setSidebarOpen(true)} />
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          menu={menu}
          selected={selected}
          onMenuClick={handleMenuClick}
        />
        <div className="max-w-5xl mx-auto py-10 px-4">
          <h2 className="text-2xl font-bold mb-6">{selectedMenu?.name || "대시보드"}</h2>
          <div className="bg-white rounded shadow p-6 min-h-[300px]">
            {selectedMenu?.component}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
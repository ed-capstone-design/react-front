import React, { useState } from "react";
import TopNav from "../components/TopNav/TopNav";
import Sidebar from "../components/SideBar/SideBar";
import InfoCard from "../components/Card/IndoCard";
import Dashboard from "./Dashboard";
import Drivers from "./Drivers";
import OperatingSchedule from "./OperatingSchedule";
import Insight from "./Insight";
import DriveDetail from "./DriveDetail";
import UserDetailPage from "./UserDetailPage"; // 추가

const menu = [
  { name: "대시보드", key: "dashboard" },
  { name: "운전자 관리", key: "drivers" },
  { name: "운행 스케줄", key: "operating-schedule" },
  { name: "인사이트", key: "insight" },
];

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected] = useState("dashboard");
  const [driveDetailId, setDriveDetailId] = useState(null);

  const handleMenuClick = (key) => {
    setSelected(key);
    setDriveDetailId(null);
    setSidebarOpen(false);
  };

  // 운행스케줄에서 DriveDetail로 전환
  const handleDriveDetail = (id) => {
    setSelected("drivedetail");
    setDriveDetailId(id);
  };

  // 메인 콘텐츠 렌더링 함수
  const renderMainContent = () => {
    switch (selected) {
      case "dashboard":
        return <Dashboard />;
      case "drivers":
        return (
          <Drivers
            onEditUserDetail={() => setSelected("userdetail")}
          />
        );
      case "operating-schedule":
        return <OperatingSchedule onDriveDetail={handleDriveDetail} />;
      case "insight":
        return <Insight />;
      case "drivedetail":
        return <DriveDetail id={driveDetailId} />;
      case "userdetail":
        return <UserDetailPage />;
      default:
        return <Dashboard />;
    }
  };

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
          <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[300px] border border-blue-100">
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
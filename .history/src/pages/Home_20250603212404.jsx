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
import { NotificationProvider } from "../components/Notification/contexts/NotificationContext";
import NotificationPanel from "../components/Notification/NotificationPanel";
import Notifications from "./Notifications";

const menu = [
  { name: "대시보드", key: "dashboard" },
  { name: "운전자 관리", key: "drivers" },
  { name: "운행 스케줄", key: "operating-schedule" },
  { name: "인사이트", key: "insight" },
];

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [selected, setSelected] = useState("dashboard");
  const [driveDetailId, setDriveDetailId] = useState(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState(null); // 추가

  const handleMenuClick = (key) => {
    setSelected(key);
    setDriveDetailId(null);
    setSidebarOpen(false);
    if (key !== "userdetail") setSelectedUserEmail(null); // 상세 진입 아닐 때 초기화
  };
  // 운행스케줄에서 DriveDetail로 전환
  const handleDriveDetail = (id) => {
    setSelected("drivedetail");
    setDriveDetailId(id);
  };
  // 인사이트에서 DriveDetail로 전환
  const handleInsightDriverClick = (driverId) => {
    setSelected("drivedetail");
    setDriveDetailId(driverId);
  };

  // DriveDetail에서 인사이트로 돌아가기
  const handleBackToInsight = () => {
    setSelected("insight");
    setDriveDetailId(null);
  };

  // 메인 콘텐츠 렌더링 함수
  const renderMainContent = () => {
    switch (selected) {
      case "dashboard":
        return <Dashboard onNotificationCardClick={() => setSelected("notifications")} />;
      case "drivers":
        return (
          <Drivers
            onUserNameClick={email => {
              setSelectedUserEmail(email);
              setSelected("userdetail");
            }}
            onEditUserDetail={user => {
              setSelectedUserEmail(user.email);
              setSelected("userdetail-edit");
            }}
          />
        );
      case "operating-schedule":
        return <OperatingSchedule onDriveDetail={handleDriveDetail} />;      case "insight":
        return <Insight onDriverClick={handleInsightDriverClick} />;
      case "drivedetail":
        return <DriveDetail id={driveDetailId} />;
      case "userdetail":
        return <UserDetailPage email={selectedUserEmail} />;
      case "userdetail-edit":
        return <UserDetailPage email={selectedUserEmail} editMode />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50 flex">
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
            onNotificationClick={() => setNotificationPanelOpen(true)}
          />
          <NotificationPanel open={notificationPanelOpen} onClose={() => setNotificationPanelOpen(false)} />
          <main className="flex-1 max-w-7xl mx-auto py-10 px-6 w-full">
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-10 min-h-[300px]">
              {selected === "notifications" ? <Notifications /> : renderMainContent()}
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default Home;
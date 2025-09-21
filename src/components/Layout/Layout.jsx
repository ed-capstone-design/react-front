import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../TopNav/TopNav";
import Sidebar from "../SideBar/SideBar";

const menu = [
  { name: "대시보드", key: "dashboard", path: "/dashboard", icon: "📊" },
  { name: "운전자 관리", key: "drivers", path: "/drivers", icon: "👨‍💼" },
  { name: "버스 관리", key: "buses", path: "/buses", icon: "🚌" },
  { name: "운행 스케줄", key: "operating-schedule", path: "/operating-schedule", icon: "📅" },
  { name: "인사이트", key: "insight", path: "/insight", icon: "📈" },
];

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menu={menu}
        selected={null}
        onMenuClick={item => {
          navigate(item.path);
          setSidebarOpen(false);
        }}
      />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopNav
          onSidebarOpen={() => setSidebarOpen(true)}
          onLogoClick={() => navigate("/dashboard")}
        />
        <main className="flex-1 max-w-7xl mx-auto py-10 px-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

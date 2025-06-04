import React, { useState } from "react";
import { IoHome, IoLogOut, IoMenu } from "react-icons/io5";
import Sidebar from "../SideBar/"; // 사이드바 import (경로 확인)

const TopNav = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <nav className="w-full bg-blue-600 py-4 px-8 flex justify-between items-center shadow">
        <div className="text-white text-2xl font-bold">운전의 진수</div>
        <div className="space-x-6 flex items-center">
          <button className="text-white hover:underline flex items-center gap-2">
            <IoHome />
            Home
          </button>
          <button className="text-white hover:underline flex items-center gap-2">
            <IoLogOut />
            로그아웃
          </button>
          <button onClick={() => setSidebarOpen(true)}>
            <IoMenu className="text-white text-2xl cursor-pointer" />
          </button>
        </div>
      </nav>
      {/* 오른쪽에서 나오는 사이드바 */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        position="right"
      />
    </>
  );
};

export default TopNav;
import React from "react";
import { IoCarSport, IoLogOut, IoMenu, IoPersonCircle } from "react-icons/io5";

const TopNav = ({ onSidebarOpen, userName = "박윤영" }) => (
  <nav className="w-full py-4 px-8 flex justify-between items-center shadow">
    <div className="flex items-center gap-2">
      <IoCarSport className="text-blue-600 text-3xl" />
      <span className="text-blue-600 text-2xl font-extrabold tracking-wide drop-shadow">
        운전의 진수
      </span>
    </div>
    <div className="space-x-6 flex items-center">
      <div className="flex items-center gap-2 text-gray-700">
        <IoPersonCircle className="text-2xl" />
        <span className="font-semibold">{userName}</span>
      </div>
      <button className="text-gray-700 hover:underline flex items-center gap-2">
        <IoLogOut />
        로그아웃
      </button>
      <button onClick={onSidebarOpen}>
        <IoMenu className="text-blue-600 text-2xl cursor-pointer" />
      </button>
    </div>
  </nav>
);

export default TopNav;
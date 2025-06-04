import React from "react";
import { IoCarSport, IoLogOut, IoMenu, IoPersonCircle, IoNotificationsOutline } from "react-icons/io5";
import { useNotifications } from "../Notification/contexts/NotificationContext";

const TopNav = ({ onSidebarOpen, onLogoClick, userName = "박윤영", onNotificationClick }) => {
  const { unreadCount } = useNotifications();

  return (
    <nav className="w-full py-4 px-8 flex justify-between items-center bg-transparent shadow-none border-none">
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={onLogoClick}
      >
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
        <button className="relative" onClick={onNotificationClick}>
          <IoNotificationsOutline className="text-2xl text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
              {unreadCount}
            </span>
          )}
        </button>
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
};

export default TopNav;
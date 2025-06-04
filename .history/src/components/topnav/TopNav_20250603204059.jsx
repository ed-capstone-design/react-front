import React from "react";
import { IoCarSport, IoLogOut, IoMenu, IoPersonCircle, IoNotificationsOutline } from "react-icons/io5";
import { useNotifications } from "../Notification/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const TopNav = ({ onSidebarOpen, onLogoClick, userName = "박윤영", onNotificationClick }) => {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    // 로그아웃 로직 (예: 로컬 스토리지 정리, 사용자 상태 초기화 등)
    localStorage.removeItem('token'); // 인증 토큰 제거
    localStorage.removeItem('user'); // 사용자 정보 제거
    
    // 로그인 페이지로 리다이렉트
    navigate('/signin');
  };

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
        </button>        <button 
          onClick={handleLogout}
          className="text-gray-700 hover:underline flex items-center gap-2 hover:text-red-600 transition-colors"
        >
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
import React from "react";
import { IoCarSport, IoLogOut, IoMenu, IoPersonCircle, IoNotificationsOutline } from "react-icons/io5";
import { useNotificationCount } from "../Notification/NotificationCountProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { useToken } from "../Token/TokenProvider";

const TopNav = ({ onSidebarOpen, onLogoClick }) => {
  const { unreadCount } = useNotificationCount(); // wsConnected 제거
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, getUserInfo, getUserInfoFromToken } = useToken();
  
  // 새로운 사용자 정보 우선, 없으면 토큰에서 추출
  const userInfo = getUserInfo() || getUserInfoFromToken();
  const userName = userInfo?.username || userInfo?.name || "사용자";

  const handleLogout = () => {
    logout(); // 토큰과 사용자 정보 모두 제거
    navigate('/signin');
  };

  const handleProfileClick = () => {
    navigate('/mypage');
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
        <div 
          className="flex items-center gap-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={handleProfileClick}
        >
          <IoPersonCircle className="text-2xl" />
          <span className="font-semibold">{userName}</span>
        </div>
        {/* 알림(종) 버튼: 인사이트 페이지에서는 숨김 */}
        {location.pathname !== "/insight" && (
          <button 
            // className={`relative ${!wsConnected ? 'opacity-70' : ''}`} 
            onClick={() => navigate('/insight')}
            title="알림" // WebSocket 연결 상태 메시지 제거
          >
            <IoNotificationsOutline className="text-2xl text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            {/* WebSocket 연결 상태 표시 - 주석 처리 (백엔드 개발 미완료) */}
            {/*
            {!wsConnected && (
              <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            )}
            */}
          </button>
        )}
        <button 
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
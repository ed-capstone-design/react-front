import React from "react";
import { IoCarSport, IoLogOut, IoMenu, IoPersonCircle, IoNotificationsOutline } from "react-icons/io5";
import { useNotifications } from "../Notification/contexts/NotificationContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useToken } from "../Token/TokenProvider";

const TopNav = ({ onSidebarOpen, onLogoClick }) => {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const { removeToken, getUserInfoFromToken } = useToken();
  
  const userInfo = getUserInfoFromToken();
  const userName = userInfo?.name || "사용자";

  const handleLogout = () => {
    removeToken(); // 인증 토큰 제거
    // 필요시 사용자 정보도 추가적으로 제거
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
          <button className="relative" onClick={() => navigate('/insight')}>
            <IoNotificationsOutline className="text-2xl text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                {unreadCount}
              </span>
            )}
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
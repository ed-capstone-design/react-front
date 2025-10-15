import React from 'react';
import { IoLogOut, IoMenu, IoPersonCircle, IoNotificationsOutline } from 'react-icons/io5';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToken } from '../Token/TokenProvider';
import { useNotification } from '../Notification/contexts/NotificationProvider';

const TopNav = ({ onLogoClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, getUserInfo, getUserInfoFromToken } = useToken();
  const { unreadCount } = useNotification();
  
  // 안전하게 사용자 정보 가져오기
  const userInfo = getUserInfo();
  const tokenUserInfo = getUserInfoFromToken();
  const displayUserInfo = userInfo || tokenUserInfo;
  const userName = displayUserInfo?.username || displayUserInfo?.name || "사용자";

  const handleLogout = () => {
    logout(); // 토큰과 사용자 정보 모두 제거
    navigate('/signin');
  };

  const handleProfileClick = () => {
    navigate('/mypage');
  };

  return (
    <nav className="w-full sticky top-0 z-30 backdrop-blur bg-sky-50/80 border-b border-sky-100/60">
      <div className="w-full px-4 sm:px-6 py-3 flex items-center">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            onClick={onLogoClick}
            aria-label="대시보드로 이동"
          >
            <img
              src={`${process.env.PUBLIC_URL}/logo.svg`}
              alt="운전의 진수"
              className="h-7 w-7 object-contain"
              onError={(e) => {
                const current = e.currentTarget.getAttribute('src') || '';
                if (current.includes('logo.svg')) {
                  e.currentTarget.src = `${process.env.PUBLIC_URL}/logo192.png`;
                } else if (current.includes('logo192.png')) {
                  e.currentTarget.src = `${process.env.PUBLIC_URL}/logo512.png`;
                }
              }}
            />
            <span className="text-blue-600 text-2xl font-extrabold tracking-wide drop-shadow">
              운전의 진수
            </span>
          </button>
        </div>
        
        <div className="space-x-6 flex items-center ml-auto">
        <button 
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          onClick={handleProfileClick}
          aria-label="내 정보로 이동"
        >
          <IoPersonCircle className="text-2xl" />
          <span className="font-semibold">{userName}</span>
        </button>


        {/* 알림 버튼 */}
        {location.pathname !== '/insight' && (
          <button 
            className="relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            onClick={() => navigate('/insight')}
            title="알림"
          >
            <IoNotificationsOutline className="text-2xl text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        )}
        <button 
          onClick={handleLogout}
          className="text-gray-700 hover:underline flex items-center gap-2 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          aria-label="로그아웃"
        >
          <IoLogOut />
          로그아웃
        </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
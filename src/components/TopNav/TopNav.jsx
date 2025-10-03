import React from "react";
import { IoLogOut, IoMenu, IoPersonCircle, IoNotificationsOutline, IoFlask } from "react-icons/io5";
// import { useNotificationCount } from "../Notification/NotificationCountProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { useToken } from "../Token/TokenProvider";
import { useWebSocket } from "../WebSocket/WebSocketProvider";
import { useNotification } from "../Notification/NotificationProvider";

const TopNav = ({ onSidebarOpen, onLogoClick, sidebarOpen }) => {
  // const { unreadCount } = useNotificationCount(); // wsConnected 제거 - 백엔드 미구현
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, getUserInfo, getUserInfoFromToken } = useToken();
  const { isConnected, subscribePersistent, subscribedDestinations } = useWebSocket();
  // 수동 구독 버튼 핸들러
  const handleManualSubscribe = () => {
    if (!isConnected) {
      alert('WebSocket이 아직 연결되지 않았습니다. (상단 연결 로직 확인)');
      return;
    }
    if (subscribedDestinations.includes('/user/queue/notifications')) {
      alert('이미 /user/queue/notifications 구독 중입니다.');
      return;
    }
    const ok = subscribePersistent('/user/queue/notifications', (msg) => {
      try { console.log('[ManualSubscribe] 수신:', msg.body); } catch {}
    });
    if (ok) {
      console.log('[ManualSubscribe] 구독 시도 완료');
    }
  };
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
  <nav className="w-full sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-gray-200/70">
  <div className="w-full px-4 sm:px-6 py-3 flex items-center">
      {/* Left: Hamburger + Logo (hide when sidebar open) */}
      {!sidebarOpen ? (
        <div className="flex items-center gap-3">
          <button onClick={onSidebarOpen} aria-label="사이드바 열기" className="p-1 rounded hover:bg-blue-50 active:bg-blue-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <IoMenu className="text-blue-600 text-2xl cursor-pointer" />
          </button>
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
      ) : (
        <div className="h-8" />
      )}
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
        {location.pathname !== "/insight" && (
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
          onClick={handleManualSubscribe}
          className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          title="/user/queue/notifications 구독"
        >
          <IoFlask className="text-xl" />
          <span className="hidden sm:inline text-sm">구독</span>
        </button>
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
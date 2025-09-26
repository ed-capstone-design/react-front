import React from "react";
import { IoCarSport, IoLogOut, IoMenu, IoPersonCircle, IoNotificationsOutline, IoWifi, IoWifiOutline } from "react-icons/io5";
// import { useNotificationCount } from "../Notification/NotificationCountProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { useToken } from "../Token/TokenProvider";
import { useWebSocket } from "../WebSocket/WebSocketProvider";

const TopNav = ({ onSidebarOpen, onLogoClick }) => {
  // const { unreadCount } = useNotificationCount(); // wsConnected 제거 - 백엔드 미구현
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, getUserInfo, getUserInfoFromToken } = useToken();
  const { isConnected, sendTestMessage, notifications, connect } = useWebSocket();
  
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
        {/* 알림(종) 버튼: 백엔드 미구현으로 주석처리 */}
        {/* WebSocket 상태 표시 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {isConnected ? (
              <IoWifi className="text-green-500 text-xl" title="실시간 연결됨" />
            ) : (
              <IoWifiOutline className="text-gray-400 text-xl" title="실시간 연결 끊김" />
            )}
            <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
              {isConnected ? '실시간' : '오프라인'}
            </span>
          </div>
          
          {/* 개발용 버튼들 - 단순화 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="flex gap-1">
              {!isConnected && (
                <button
                  onClick={connect}
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                  title="WebSocket 수동 연결"
                >
                  연결
                </button>
              )}
              <button
                onClick={sendTestMessage}
                disabled={!isConnected}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded disabled:opacity-50 hover:bg-blue-600 transition-colors"
                title="WebSocket 테스트 메시지 전송"
              >
                테스트
              </button>
            </div>
          )}
        </div>

        {/* 알림 버튼 */}
        {location.pathname !== "/insight" && (
          <button 
            className="relative"
            onClick={() => navigate('/insight')}
            title="알림"
          >
            <IoNotificationsOutline className="text-2xl text-gray-700" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                {notifications.length > 99 ? '99+' : notifications.length}
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
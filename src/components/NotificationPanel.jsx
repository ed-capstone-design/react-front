import React from "react";
import { IoClose, IoRefreshOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "./contexts/NotificationContext";

const NotificationPanel = ({ open, onClose }) => {
  const { 
    notifications, 
    removeNotification, 
    markAsRead, 
    refreshNotifications,
    loading 
  } = useNotifications();

  const navigate = useNavigate();

  // 시간 형식 변환 함수
  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
  };

  // 알림 타입에 따른 스타일
  const getNotificationStyle = (type, priority) => {
    let baseStyle = "flex items-start justify-between rounded-lg px-4 py-3 mb-3 shadow-sm group transition-colors cursor-pointer";
    
    if (priority === 'urgent') {
      baseStyle += " bg-red-50 border-l-4 border-red-500";
    } else if (priority === 'high') {
      baseStyle += " bg-orange-50 border-l-4 border-orange-500";
    } else if (type === 'success') {
      baseStyle += " bg-green-50 border-l-4 border-green-500";
    } else if (type === 'warning') {
      baseStyle += " bg-yellow-50 border-l-4 border-yellow-500";
    } else {
      baseStyle += " bg-gray-50 border-l-4 border-blue-500";
    }
    
    return baseStyle;
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // 액션에 따른 페이지 이동
    switch (notification.action) {
      case 'view_driver':
        if (notification.relatedId) {
          navigate(`/user-detail/${notification.relatedId}`);
        }
        break;
      case 'view_dispatch':
        if (notification.relatedId) {
          navigate('/operating-schedule');
        }
        break;
      case 'view_warning':
        navigate('/notifications');
        break;
      default:
        navigate('/notifications');
        break;
    }
    
    // 패널 닫기
    onClose();
  };

  return (
    <aside className={`fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-100 shadow-lg z-40 transition-transform duration-200 ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <span className="font-bold text-lg text-gray-900">알림</span>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshNotifications}
            className="text-gray-400 hover:text-gray-700 text-xl"
            disabled={loading}
          >
            <IoRefreshOutline className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl font-bold">
            <IoClose />
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-64px)] p-4">
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">알림을 불러오는 중...</p>
          </div>
        )}
        
        {!loading && notifications.filter(n => !n.read).length === 0 && (
          <div className="text-gray-400 text-center py-10">확인하지 않은 알림이 없습니다.</div>
        )}
        
        {!loading && (
          <ul>
            {notifications.filter(n => !n.read).map(notification => (
              <li 
                key={notification.id} 
                className={getNotificationStyle(notification.type, notification.priority)}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm text-gray-900">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{notification.message}</p>
                  {notification.priority === 'urgent' && (
                    <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded mt-2">
                      긴급
                    </span>
                  )}
                  {notification.priority === 'high' && (
                    <span className="inline-block bg-orange-500 text-white text-xs px-2 py-1 rounded mt-2">
                      높음
                    </span>
                  )}
                </div>
                <button
                  className="ml-3 text-gray-400 hover:text-red-500 text-lg flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  aria-label="알림 삭제"
                >
                  <IoClose />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default NotificationPanel;
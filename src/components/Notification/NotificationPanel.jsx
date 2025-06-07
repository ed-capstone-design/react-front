import React, { useState } from "react";
import { 
  IoClose, 
  IoCheckmarkCircle, 
  IoWarning, 
  IoAlert, 
  IoInformationCircle,
  IoTimeOutline,
  IoFilterOutline,
  IoCheckmarkDoneOutline,
  IoTrashOutline
} from "react-icons/io5";
import { useNotifications } from "./contexts/NotificationContext";

const NotificationPanel = ({ open, onClose }) => {
  const { 
    // notifications, 
    unreadCount, 
    priorityCounts, 
    typeCounts, 
    markAsRead, 
    removeNotification, 
    markAllAsRead,
    getFilteredNotifications 
  } = useNotifications();
  
  const [filter, setFilter] = useState({
    unreadOnly: true,
    type: "all",
    priority: "all"
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case "success": return <IoCheckmarkCircle className="text-green-500" />;
      case "warning": return <IoWarning className="text-yellow-500" />;
      case "error": return <IoAlert className="text-red-500" />;
      default: return <IoInformationCircle className="text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "border-l-red-500 bg-red-50";
      case "high": return "border-l-orange-500 bg-orange-50";
      case "normal": return "border-l-blue-500 bg-blue-50";
      case "low": return "border-l-gray-500 bg-gray-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  const filteredNotifications = getFilteredNotifications(filter);
  return (
    <aside className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-100 shadow-xl z-40 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-gray-900">알림</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              title="모두 읽음 처리"
            >
              <IoCheckmarkDoneOutline className="text-lg" />
            </button>
          )}
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
          >
            <IoClose />
          </button>
        </div>
      </div>

      {/* 통계 대시보드 */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-xs text-gray-600 mb-1">긴급/높음</div>
            <div className="text-lg font-bold text-red-600">
              {priorityCounts.urgent + priorityCounts.high}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-xs text-gray-600 mb-1">오류/경고</div>
            <div className="text-lg font-bold text-orange-600">
              {typeCounts.error + typeCounts.warning}
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex items-center gap-2 mb-2">
          <IoFilterOutline className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">필터</span>
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={filter.unreadOnly}
                onChange={(e) => setFilter({ ...filter, unreadOnly: e.target.checked })}
                className="rounded"
              />
              읽지 않음만
            </label>
          </div>
          <div className="flex gap-2">
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="text-xs border rounded px-2 py-1 flex-1"
            >
              <option value="all">모든 타입</option>
              <option value="error">오류</option>
              <option value="warning">경고</option>
              <option value="info">정보</option>
              <option value="success">성공</option>
            </select>
            <select
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
              className="text-xs border rounded px-2 py-1 flex-1"
            >
              <option value="all">모든 우선순위</option>
              <option value="urgent">긴급</option>
              <option value="high">높음</option>
              <option value="normal">보통</option>
              <option value="low">낮음</option>
            </select>
          </div>
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="overflow-y-auto h-[calc(100%-280px)] p-4">
        {filteredNotifications.length === 0 && (
          <div className="text-gray-400 text-center py-10">
            <IoInformationCircle className="text-4xl mx-auto mb-2 opacity-50" />
            <div>표시할 알림이 없습니다.</div>
          </div>
        )}
        <div className="space-y-3">
          {filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`border-l-4 rounded-lg p-4 shadow-sm transition-all hover:shadow-md ${getPriorityColor(notification.priority)} ${!notification.read ? 'ring-1 ring-blue-200' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(notification.type)}
                  <div className="font-semibold text-sm text-gray-900">
                    {notification.title}
                  </div>
                  {notification.priority === "urgent" && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      긴급
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                      title="읽음 처리"
                    >
                      <IoCheckmarkCircle />
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-red-500 text-sm"
                    title="삭제"
                  >
                    <IoTrashOutline />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-2">
                {notification.message}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <IoTimeOutline />
                  {formatTimeAgo(notification.timestamp)}
                </div>
                {notification.action && (
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    조치하기
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default NotificationPanel;
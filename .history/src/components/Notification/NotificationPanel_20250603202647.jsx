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
    notifications, 
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
    <aside className={`fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-100 shadow-lg z-40 transition-transform duration-200 ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <span className="font-bold text-lg text-gray-900">알림</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl font-bold"><IoClose /></button>
      </div>
      <div className="overflow-y-auto h-[calc(100%-64px)] p-4">
        {notifications.filter(n => !n.read).length === 0 && (
          <div className="text-gray-400 text-center py-10">확인하지 않은 알림이 없습니다.</div>
        )}
        <ul>
          {notifications.filter(n => !n.read).map(n => (
            <li key={n.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 mb-3 shadow-sm group">
              <div className="flex-1 text-gray-800 text-sm">{n.message}</div>
              <button
                className="ml-3 text-gray-400 hover:text-red-500 text-lg"
                onClick={() => removeNotification(n.id)}
                aria-label="알림 삭제"
              >
                <IoClose />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default NotificationPanel;
import React from "react";
import { IoClose } from "react-icons/io5";
import { useNotifications } from "../contexts/NotificationContext";

const NotificationPanel = ({ open, onClose }) => {
  const { notifications, markAsRead, removeNotification } = useNotifications();

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
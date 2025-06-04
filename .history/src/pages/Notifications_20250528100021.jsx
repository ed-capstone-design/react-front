import React from "react";
import { useNotifications } from "../components/Notification/contexts/NotificationContext";

const Notifications = () => {
  const { notifications } = useNotifications();

  const today = new Date().toISOString().slice(0, 10);
  const todayNotis = notifications.filter(n => n.date === today);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">알림 및 경고 집계</h2>
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">금일 발생 알림</h3>
        <ul>
          {todayNotis.length === 0 ? (
            <li className="text-gray-400 py-4">금일 알림이 없습니다.</li>
          ) : (
            todayNotis.map(n => (
              <li key={n.id} className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-50">
                <span className="text-gray-800">{n.message}</span>
                {/* 삭제 버튼 없음 */}
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 통계</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>전체 알림 수: {notifications.length}건</li>
          <li>미확인 알림: {notifications.filter(n => !n.read).length}건</li>
          <li>경고(Warning) 알림: {notifications.filter(n => n.type === "warning").length}건</li>
        </ul>
      </div>
    </div>
  );
};

export default Notifications;
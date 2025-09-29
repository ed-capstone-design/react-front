import React from 'react';
import { useNotification } from '../components/Notification/NotificationProvider';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { notifications, unreadCount, loading, error, refresh, markAsRead } = useNotification();
  const navigate = useNavigate();

  const onClickItem = (n) => {
    markAsRead(n.id);
    if (n.url) navigate(n.url);
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto p-6">로딩 중...</div>;
  }
  if (error) {
    return <div className="max-w-5xl mx-auto p-6 text-red-600">알림을 불러오지 못했습니다.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">알림 ({unreadCount}개 미읽음)</h1>
        <button onClick={refresh} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded">새로고침</button>
      </div>
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm divide-y">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => onClickItem(n)}
            className={`w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50 ${n.isRead ? 'opacity-70' : ''}`}
          >
            <div className={`mt-1 w-2 h-2 rounded-full ${n.isRead ? 'bg-gray-300' : 'bg-red-500'}`} />
            <div className="flex-1">
              <div className="text-sm text-gray-900">{n.message}</div>
              <div className="text-xs text-gray-500 mt-1">{n.createdAt.toLocaleString('ko-KR')}</div>
            </div>
            {n.url && <div className="text-xs text-blue-600">바로가기</div>}
          </button>
        ))}
        {notifications.length === 0 && (
          <div className="p-6 text-center text-gray-500">알림이 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

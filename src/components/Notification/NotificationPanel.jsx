import React from 'react';
import { useNotification } from './contexts/NotificationProvider';

/**
 * NotificationPanel
 * 우측 패널/사이드바 형태로 재사용 가능한 알림 리스트 컴포넌트
 * - 가벼운 내부 페이지네이션 (기본 15)
 * - 읽음 처리 / 이동 버튼 지원
 */
const NotificationPanel = ({ pageSize = 15, onNavigate }) => {
  const { notifications = [], unreadCount = 0, markAsRead } = useNotification();
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState('ALL'); // ALL | UNREAD | READ

  const sorted = React.useMemo(() => [...notifications].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)), [notifications]);

  const filtered = React.useMemo(() => {
    if (filter === 'UNREAD') return sorted.filter(n => !n.isRead);
    if (filter === 'READ') return sorted.filter(n => n.isRead);
    return sorted;
  }, [sorted, filter]);
  const totalPages = React.useMemo(() => Math.ceil(filtered.length / pageSize) || 0, [filtered.length, pageSize]);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [totalPages, page]);

  const slice = React.useMemo(() => {
    if (!totalPages) return [];
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, totalPages]);

  const formatDateTime = (d) => new Date(d).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">알림</h3>
        <span className="text-xs text-gray-500">미읽음 {unreadCount}개</span>
      </div>
      <div className="flex gap-1 mb-2 text-xs">
        {['ALL','UNREAD','READ'].map(t => (
          <button
            key={t}
            onClick={() => { setFilter(t); setPage(1); }}
            className={`px-2 py-1 rounded-md border transition ${filter===t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {t === 'ALL' ? '전체' : t === 'UNREAD' ? '미읽음' : '읽음'}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 divide-y bg-white">
        {slice.length === 0 ? (
          <div className="p-5 text-center text-gray-500 text-sm">알림이 없습니다.</div>
        ) : slice.map(n => (
          <div key={n.id} className={`p-3 flex items-start justify-between text-sm ${n.isRead ? 'bg-white' : 'bg-sky-50'}`}>
            <div className="flex-1 pr-3 min-w-0">
              <div className="font-medium text-gray-900 break-words">{n.message || '알림'}</div>
              <div className="text-[11px] text-gray-500 mt-1">{formatDateTime(n.createdAt)}</div>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {n.url && (
                <button
                  className="text-[11px] text-blue-600 hover:text-blue-800 underline"
                  onClick={() => onNavigate ? onNavigate(n.url) : (window.location.href = n.url)}
                >이동</button>
              )}
              {!n.isRead && (
                <button
                  className="text-[11px] text-slate-600 hover:text-slate-800"
                  onClick={async () => { try { await markAsRead(n.id); } catch (e) { console.warn('markAsRead failed', e); } }}
                >읽음</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
        <div>페이지 {totalPages ? page : 0} / {totalPages}</div>
        <div className="flex gap-1">
          <button
            className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >이전</button>
          <button
            className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >다음</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;

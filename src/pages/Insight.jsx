import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInsightData } from '../hooks/PageCustomHook/useInsightData';
import { useNotification, useReadNotification } from '../hooks/QueryLayer/useNotification';
import KakaoMapContainer from '../components/Map/KakaoMapContainer';
import RealtimeMarkers from '../components/Map/RealtimeMarkers';

const Insight = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('running');

  // 훅에서 데이터 가져오기
  const { loading, kpis, runningList, runningEventsStats } = useInsightData();
  const { data: notifications = [] } = useNotification();
  const { mutate: markAsRead } = useReadNotification();

  // 알림 미읽음 개수 및 페이지네이션
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const pagedNotifications = useMemo(() => notifications.slice(0, 10), [notifications]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* 1. TOP 지표 섹션 (기존 디자인 복구) */}
      <section className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">인사이트</h2>
        <div className="flex flex-wrap items-center gap-2">
          <InlineKpi label="금일 총 배차" value={kpis.todayTotal} tone="indigo" loading={loading} />
          <InlineKpi label="금일 완료" value={kpis.todayCompleted} tone="emerald" loading={loading} />
          <InlineKpi label="금일 지연" value={kpis.todayDelayed} tone="rose" loading={loading} />
          <InlineKpi label="남은 배차" value={kpis.todayRemaining} tone="blue" loading={loading} />
          <InlineKpi label="평균 점수" value={runningEventsStats.drivingScoreAverage} tone="emerald" />
        </div>
      </section>

      {/* 2. 메인 콘텐츠 (지도 70 : 패널 30) */}
      <section className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        {/* 지도 영역 */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border p-4">
          <KakaoMapContainer height="450px">
            {/* 📍 마커 부분에 나중에 웹소켓 실시간 좌표 연결 예정 */}
            <RealtimeMarkers
              drivers={runningList.map(r => ({
                lat: r.latitude || 37.5665,
                lng: r.longitude || 126.978,
                label: r.driverName || r.vehicleNumber
              }))}
            />
          </KakaoMapContainer>
        </div>

        {/* 우측 탭 패널 */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border flex flex-col h-[482px]">
          <div className="flex border-b text-sm font-bold">
            <button
              onClick={() => setActiveTab('running')}
              className={`flex-1 py-3 ${activeTab === 'running' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-400'}`}
            >
              운행 ({runningList.length})
            </button>
            <button
              onClick={() => setActiveTab('noti')}
              className={`flex-1 py-3 ${activeTab === 'noti' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-400'}`}
            >
              알림 ({unreadCount})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === 'running' ? (
              <ul className="space-y-2">
                {runningList.map(d => (
                  <li key={d.dispatchId} className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer" onClick={() => navigate(`/realtime-operation/${d.dispatchId}`)}>
                    <div className="font-bold text-sm">{d.driverName}</div>
                    <div className="text-xs text-gray-500">{d.vehicleNumber}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2">
                {pagedNotifications.map(n => (
                  <li key={n.id} onClick={() => markAsRead(n.id)} className={`p-3 border rounded-lg text-xs cursor-pointer ${!n.isRead ? 'bg-blue-50' : ''}`}>
                    <p className="line-clamp-2">{n.message}</p>
                    <span className="text-gray-400 mt-1 block">{new Date(n.createdAt).toLocaleTimeString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

// 헬퍼 컴포넌트 (기존 디자인 스타일)
const InlineKpi = ({ label, value, tone, loading }) => (
  <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-2 bg-${tone}-50 border-${tone}-200 text-${tone}-700`}>
    <span className="opacity-70">{label}</span>
    <span>{loading ? "..." : value}</span>
  </div>
);

export default Insight;
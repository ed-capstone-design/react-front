import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoBus, IoPersonCircle, IoWarning, IoStatsChart, IoArrowBack } from "react-icons/io5";

import KakaoMapContainer from "../components/Map/KakaoMapContainer";
import RoutePolyline from "../components/Map/RoutePolyline";
import EventMarkers from "../components/Map/EventMarkers";
import RealtimeMarkers from "../components/Map/RealtimeMarkers";

// ✅ 구축된 쿼리 레이어 임포트
import {
  useDispatchDetail,
  useDispatchRecord,
  useDispatchEvents,
  useDispatchPath,
  useStartDispatch,
  useCompleteDispatch
} from "../hooks/QueryLayer/useDispatch";

const DriveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- 1. 데이터 레이어 소비 (선언적 조회) ---
  const { data: driveData, isLoading: isDetailLoading, isError: isDetailError } = useDispatchDetail(id);
  const { data: driveRecord } = useDispatchRecord(id);
  const { data: driveLocations = [] } = useDispatchPath(id);
  const { data: driveEvents = [] } = useDispatchEvents(id);

  // --- 2. 액션 레이어 소비 (뮤테이션) ---
  const { mutate: startDispatch } = useStartDispatch();
  const { mutate: completeDispatch } = useCompleteDispatch();

  // --- 3. 헬퍼 로직: 이벤트 아이콘 매핑 ---
  const getEventIcon = (eventType) => {
    const icons = {
      DROWSINESS: 'https://cdn-icons-png.flaticon.com/512/565/565547.png',
      ACCELERATION: 'https://cdn-icons-png.flaticon.com/512/565/565604.png',
      BRAKING: 'https://cdn-icons-png.flaticon.com/512/565/565606.png',
      SMOKING: 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png',
      SEATBELT_UNFASTENED: 'https://cdn-icons-png.flaticon.com/512/2919/2919906.png',
      PHONE_USAGE: 'https://cdn-icons-png.flaticon.com/512/15047/15047587.png',
    };
    return icons[eventType] || undefined;
  };

  // --- 4. 데이터 가공 (통계 및 지도 마커) ---
  const { eventStats, mapMarkers, driveEventsWithIndex } = useMemo(() => {
    const stats = {
      total: driveEvents.length,
      byType: {
        DROWSINESS: 0, ACCELERATION: 0, BRAKING: 0,
        SMOKING: 0, SEATBELT_UNFASTENED: 0, PHONE_USAGE: 0,
      },
    };

    // 시간순 정렬 및 인덱스 부여
    const sortedEvents = [...driveEvents]
      .sort((a, b) => new Date(a.eventTimestamp || a.eventTime) - new Date(b.eventTimestamp || b.eventTime))
      .map((ev, idx) => ({ ...ev, _index: idx + 1 }));

    const markers = sortedEvents.map((ev) => {
      if (ev.eventType in stats.byType) stats.byType[ev.eventType] += 1;
      return {
        lat: ev.latitude != null ? Number(ev.latitude) : null,
        lng: ev.longitude != null ? Number(ev.longitude) : null,
        imageSrc: getEventIcon(ev.eventType),
        label: ev._index,
      };
    }).filter(m => Number.isFinite(m.lat) && Number.isFinite(m.lng));

    return { eventStats: stats, mapMarkers: markers, driveEventsWithIndex: sortedEvents };
  }, [driveEvents]);

  // --- 5. 점수 및 핸들러 ---
  const displayScore = driveRecord?.drivingScore ?? driveData?.dispatch?.drivingScore ?? 0;
  const handleStartDispatch = () => { if (window.confirm("운행을 시작하시겠습니까?")) startDispatch(id); };
  const handleEndDispatch = () => { if (window.confirm("운행을 종료하시겠습니까?")) completeDispatch(id); };

  // --- 6. 조건부 렌더링 (로딩/에러) ---
  if (isDetailLoading) return <div className="max-w-4xl mx-auto py-10 px-4 text-center text-gray-500">운행 상세 정보를 불러오는 중...</div>;
  if (isDetailError || !driveData) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <IoWarning className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800">데이터를 불러올 수 없습니다.</h2>
          <button onClick={() => navigate(-1)} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg">뒤로가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
        <IoArrowBack className="text-lg" />
        <span className="font-medium">뒤로가기</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 좌측 프로필 패널 */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-6">
            <div className="text-center mb-6">
              <IoBus className="text-blue-500 text-7xl mx-auto mb-4 drop-shadow" />
              <div className="text-xl font-bold text-gray-900 mb-1">배차 정보</div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r">
              <div className="text-sm text-blue-600">운행 날짜</div>
              <div className="text-lg font-bold text-blue-700">{driveData.dispatch.dispatchDate || '날짜 없음'}</div>
            </div>

            <div className="border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <IoPersonCircle className="text-blue-500 text-2xl" />
                <div className="font-bold text-gray-900">{driveData.driver.username || '운전자 정보 없음'}</div>
              </div>
            </div>

            <div className="border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <IoBus className="text-green-500 text-2xl" />
                <div>
                  <div className="font-bold text-gray-900">{driveData.bus.vehicleNumber}</div>
                  <div className="text-sm text-gray-500">{driveData.bus.routeNumber}번 노선</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>예정 출발</span><span className="font-semibold">{driveData.dispatch.scheduledDepartureTime ? new Date(driveData.dispatch.scheduledDepartureTime).toLocaleTimeString() : '-'}</span></div>
              <div className="flex justify-between"><span>실제 출발</span><span className="font-semibold">{driveData.dispatch.actualDepartureTime ? new Date(driveData.dispatch.actualDepartureTime).toLocaleTimeString() : '-'}</span></div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-600">상태</span>
                <span className={`font-bold px-3 py-1 rounded-full text-xs ${driveData.dispatch.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                  {driveData.dispatch.status === "COMPLETED" ? "완료" : driveData.dispatch.status === "RUNNING" ? "운행중" : "대기"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              {driveData.dispatch.status === "SCHEDULED" && (
                <button onClick={handleStartDispatch} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                  <IoStatsChart /> 운행 시작
                </button>
              )}
              {driveData.dispatch.status === "RUNNING" && (
                <button onClick={handleEndDispatch} className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2">
                  <IoWarning /> 운행 종료
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 우측 메인 패널 */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* 통계 테이블 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4">이상감지 통계</h3>
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <table className="min-w-full text-center">
                <thead>
                  <tr className="text-xs font-bold text-gray-600">
                    <th className="px-2">총 이벤트</th><th className="px-2 text-red-600">졸음</th><th className="px-2 text-yellow-600">급가속</th>
                    <th className="px-2 text-orange-600">급제동</th><th className="px-2 text-purple-600">흡연</th><th className="px-2 text-blue-600">안전벨트</th><th className="px-2 text-pink-600">휴대폰</th>
                  </tr>
                </thead>
                <tbody className="text-lg font-bold">
                  <tr>
                    <td>{eventStats.total}</td><td>{eventStats.byType.DROWSINESS}</td><td>{eventStats.byType.ACCELERATION}</td>
                    <td>{eventStats.byType.BRAKING}</td><td>{eventStats.byType.SMOKING}</td><td>{eventStats.byType.SEATBELT_UNFASTENED}</td><td>{eventStats.byType.PHONE_USAGE}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right font-medium text-sm">운행 점수: <span className="font-bold text-blue-600 text-base">{displayScore}점</span></div>
          </div>

          {/* 지도 영역 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4">운행 경로 및 이벤트 지도</h3>
            <KakaoMapContainer height="400px" level={4}>
              <RoutePolyline path={driveLocations.map(l => ({ lat: Number(l.latitude), lng: Number(l.longitude) }))} color="#2563eb" />
              <EventMarkers mode="pin" events={mapMarkers} />
              <RealtimeMarkers drivers={[{
                lat: Number(driveData.bus.latitude || 0), lng: Number(driveData.bus.longitude || 0),
                label: driveData.driver.username || driveData.bus.vehicleNumber
              }].filter(d => d.lat !== 0)} />
            </KakaoMapContainer>
          </div>

          {/* 이벤트 이력 리스트 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4">상세 이벤트 이력</h3>
            <div className="max-h-80 overflow-y-auto space-y-3">
              {driveEventsWithIndex.length === 0 ? (
                <p className="text-center text-gray-400 py-10">기록된 이벤트가 없습니다.</p>
              ) : (
                driveEventsWithIndex.map((ev) => (
                  <div key={ev._index} className="border rounded-lg p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">{ev._index}</span>
                      <div>
                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded mr-2">{ev.eventType}</span>
                        <p className="text-sm text-gray-600 mt-1">{ev.description || "이벤트 상세 설명 없음"}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{ev.eventTimestamp ? new Date(ev.eventTimestamp).toLocaleTimeString() : "-"}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriveDetail;
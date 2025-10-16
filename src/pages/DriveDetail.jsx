import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoBus, IoPersonCircle, IoWarning, IoStatsChart, IoArrowBack } from "react-icons/io5";
import axios from "axios";
import { useDriverAPI } from "../hooks/useDriverAPI";
import { useDriverDispatchAPI } from "../hooks/useDriverDispatchAPI";
import { useToken } from "../components/Token/TokenProvider";
import KakaoMap from "../components/Map/Map";
import { useDriveDetailAPI } from "../hooks/useDriveDetailAPI";

const DriveDetail = ({ onBackToInsight }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchDriverDetail } = useDriverAPI();
  const { fetchMyDispatchById, startMyDispatch, endMyDispatch } = useDriverDispatchAPI();
  const { getToken, getUserInfo } = useToken();
  const { fetchDriveLocations, fetchDriveEvents, fetchDriveRecord } = useDriveDetailAPI();

  // 기본 정보 상태 복원
  const [driveData, setDriveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // events 기반 상태 유지
  const [driveLocations, setDriveLocations] = useState([]);
  const [driveEvents, setDriveEvents] = useState([]);
  const [driveRecord, setDriveRecord] = useState(null);
  const [extraError, setExtraError] = useState(null); // 경로/이벤트/기록 조회 오류 메시지

  // 실시간 WS 미사용: 완료 배차는 REST 데이터만 사용

  useEffect(() => {
    if (!id) return;
    fetchDriveDetail();
    fetchDriveExtraData();
  }, [id]);

  // 기존 배차/운전자/버스/에러/로딩 처리 복원
  const fetchDriveDetail = async () => {
    try {
      const userInfo = getUserInfo();
      const userRole = userInfo?.role || 'UNKNOWN';
      let dispatchData = null;
      if (userRole === 'DRIVER') {
        dispatchData = await fetchMyDispatchById(id);
      } else {
        try {
          const token = getToken();
          const response = await axios.get(`/api/admin/dispatches/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          dispatchData = response.data?.data || response.data;
        } catch (adminError) {
          dispatchData = await fetchMyDispatchById(id);
        }
      }
      if (!dispatchData) throw new Error('배차 정보를 찾을 수 없습니다.');
      const driverId = dispatchData.driverId;
      const driverResponse = await fetchDriverDetail(driverId);
      const busId = dispatchData.busId;
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const busResponse = await axios.get(`/api/admin/buses/${busId}`, { headers });
      const finalData = {
        dispatch: dispatchData,
        driver: driverResponse,
        bus: busResponse.data?.data || busResponse.data
      };
      setDriveData(finalData);
      setError(null);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("접근 권한이 없습니다. 해당 배차 정보를 조회할 권한이 없거나, 다른 사용자의 배차일 수 있습니다.");
      } else if (err.response?.status === 404) {
        setError("배차 정보를 찾을 수 없습니다. 배차 ID를 확인해주세요.");
      } else if (err.response?.status === 401) {
        setError("인증이 필요합니다. 다시 로그인해주세요.");
      } else {
        setError(err.response?.data?.message || err.message || "데이터를 불러올 수 없습니다.");
      }
      setDriveData(null);
    } finally {
      setLoading(false);
    }
  };

  // 운행 경로/이벤트/기록 데이터 불러오기
  const fetchDriveExtraData = async () => {
    try {
      const [locations, events, record] = await Promise.all([
        fetchDriveLocations(id),
        fetchDriveEvents(id),
        fetchDriveRecord(id),
      ]);
      setDriveLocations(locations || []);
      setDriveEvents(events || []);
      setDriveRecord(record || null);
      setExtraError(null);
    } catch (e) {
      setDriveLocations([]);
      setDriveEvents([]);
      setDriveRecord(null);
      // 집계된 오류 메시지 구성 (폴백 시도 결과 포함 가능)
      const details = e?.details ? ` (시도 경로: ${e.details.map(d => `${d.url}${d.status ? `:${d.status}` : ''}`).join(', ')})` : '';
      setExtraError(e?.message ? `${e.message}${details}` : `운행 부가 데이터 조회 실패${details}`);
    }
  };

  // 운행 시작 핸들러
  const handleStartDispatch = async () => {
    try {
      const result = await startMyDispatch(id);
      if (result.success) {
        // 성공 시 데이터 새로고침
        await fetchDriveDetail();
        alert('운행을 시작했습니다.');
      } else {
        alert(result.error || '운행 시작에 실패했습니다.');
      }
    } catch (error) {
      console.error('운행 시작 오류:', error);
      alert('운행 시작 중 오류가 발생했습니다.');
    }
  };

  // 운행 종료 핸들러
  const handleEndDispatch = async () => {
    try {
      const result = await endMyDispatch(id);
      if (result.success) {
        // 성공 시 데이터 새로고침
        await fetchDriveDetail();
        alert('운행을 종료했습니다.');
      } else {
        alert(result.error || '운행 종료에 실패했습니다.');
      }
    } catch (error) {
      console.error('운행 종료 오류:', error);
      alert('운행 종료 중 오류가 발생했습니다.');
    }
  };

  // events 데이터 기반 경고 통계 계산
  const calculateEventStats = (events) => {
    const stats = {
      total: events.length,
      byType: {},
    };
    events.forEach(ev => {
      stats.byType[ev.eventType] = (stats.byType[ev.eventType] || 0) + 1;
    });
    return stats;
  };
  const eventStats = calculateEventStats(driveEvents);

  // 실시간 구독 제거: 이 페이지는 완료된 배차의 운행 경로를 REST로만 표시합니다.

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">운행 상세 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <IoArrowBack className="text-lg" />
          <span className="font-medium">뒤로가기</span>
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <IoWarning className="text-red-500 text-2xl" />
            <h2 className="text-lg font-semibold text-red-800">데이터 로딩 실패</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchDriveDetail}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!driveData) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">운행 정보를 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <IoArrowBack className="text-lg" />
        <span className="font-medium">뒤로가기</span>
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 좌측 프로필 패널 */}
        <div className="lg:col-span-1">
          {/* 배차 정보 카드 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-6">
            <div className="text-center mb-6">
              <IoBus className="text-blue-500 text-7xl mx-auto mb-4 drop-shadow" />
              <div className="text-xl font-bold text-gray-900 mb-1">배차 정보</div>
            </div>
            
            {/* 날짜 강조 (상단에만 표시) */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r">
              <div className="text-sm text-blue-600">운행 날짜</div>
              <div className="text-lg font-bold text-blue-700">
                {driveData.dispatch.dispatchDate
                  ? driveData.dispatch.dispatchDate
                  : (driveData.dispatch.scheduledDepartureTime
                      ? driveData.dispatch.scheduledDepartureTime.split('T')[0]
                      : '날짜 없음')}
              </div>
            </div>

            {/* 운전자 정보 */}
            <div className="border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <IoPersonCircle className="text-blue-500 text-2xl" />
                <div>
                  <div className="font-bold text-gray-900">{driveData.driver.username || driveData.driver.driverName || '운전자명 없음'}</div>

                </div>
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                {driveData.driver.phoneNumber || '전화번호 없음'}
              </div>
            </div>

            {/* 버스 정보 */}
            <div className="border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <IoBus className="text-green-500 text-2xl" />
                <div>
                  <div className="font-bold text-gray-900">{driveData.bus.vehicleNumber || '차량번호 없음'}</div>
                  <div className="text-sm text-gray-500">{driveData.bus.routeNumber || '노선번호'}번 노선</div>
                </div>
              </div>
            </div>

            {/* 운행 상세 정보 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm">예정 출발</span>
                <span className="font-semibold text-gray-900">
                  {driveData.dispatch.scheduledDepartureTime
                    ? new Date(driveData.dispatch.scheduledDepartureTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm">예정 도착</span>
                <span className="font-semibold text-gray-900">
                  {driveData.dispatch.scheduledArrivalTime
                    ? new Date(driveData.dispatch.scheduledArrivalTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm">실제 출발</span>
                <span className="font-semibold text-gray-900">
                  {driveData.dispatch.actualDepartureTime
                    ? new Date(driveData.dispatch.actualDepartureTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm">실제 도착</span>
                <span className="font-semibold text-gray-900">
                  {driveData.dispatch.actualArrivalTime
                    ? new Date(driveData.dispatch.actualArrivalTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm">운행 상태</span>
                <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                  driveData.dispatch.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  driveData.dispatch.status === "RUNNING" ? "bg-blue-100 text-blue-700" :
                  driveData.dispatch.status === "DELAYED" ? "bg-orange-100 text-orange-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {driveData.dispatch.status === "COMPLETED" ? "완료" :
                   driveData.dispatch.status === "RUNNING" ? "운행중" :
                   driveData.dispatch.status === "DELAYED" ? "지연" : "대기"}
                </span>
              </div>
              {driveData.dispatch.drivingScore && (
                <div className="flex justify-between items-center py-2 mt-4 bg-green-50 px-3 rounded border-l-4 border-green-400">
                  <span className="text-green-700 text-sm font-medium">운전 점수</span>
                  <span className="font-bold text-green-800 text-lg">{driveData.dispatch.drivingScore}점</span>
                </div>
              )}
            </div>

            {/* 운행 제어 버튼 */}
            <div className="mt-6 space-y-3">
              {driveData.dispatch.status === "SCHEDULED" && (
                <button
                  onClick={handleStartDispatch}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <IoStatsChart className="text-lg" />
                  운행 시작
                </button>
              )}
              
              {driveData.dispatch.status === "RUNNING" && (
                <button
                  onClick={handleEndDispatch}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <IoWarning className="text-lg" />
                  운행 종료
                </button>
              )}
              
              {driveData.dispatch.status === "COMPLETED" && (
                <div className="w-full bg-gray-100 text-gray-500 py-3 px-4 rounded-lg font-semibold text-center">
                  운행 완료
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 우측 메인 패널 */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* 이상감지 통계 - 표로 가로 배치 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">이상감지 통계</h3>
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <table className="min-w-full text-center">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-xs font-bold text-gray-600">총 이벤트</th>
                    <th className="px-4 py-2 text-xs font-bold text-red-600">졸음운전</th>
                    <th className="px-4 py-2 text-xs font-bold text-yellow-600">급가속</th>
                    <th className="px-4 py-2 text-xs font-bold text-orange-600">급제동</th>
                    <th className="px-4 py-2 text-xs font-bold text-purple-600">흡연</th>
                    <th className="px-4 py-2 text-xs font-bold text-blue-600">안전벨트</th>
                    <th className="px-4 py-2 text-xs font-bold text-pink-600">휴대폰사용</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-3 text-lg font-bold text-blue-600 bg-blue-50 rounded">{eventStats.total || 0}</td>
                    <td className="px-4 py-3 text-lg font-bold text-red-600 bg-red-50 rounded">{eventStats.byType.DROWSINESS || 0}</td>
                    <td className="px-4 py-3 text-lg font-bold text-yellow-600 bg-yellow-50 rounded">{eventStats.byType.ACCELERATION || 0}</td>
                    <td className="px-4 py-3 text-lg font-bold text-orange-600 bg-orange-50 rounded">{eventStats.byType.BRAKING || 0}</td>
                    <td className="px-4 py-3 text-lg font-bold text-purple-600 bg-purple-50 rounded">{eventStats.byType.SMOKING || 0}</td>
                    <td className="px-4 py-3 text-lg font-bold text-blue-600 bg-blue-50 rounded">{eventStats.byType.SEATBELT_UNFASTENED || 0}</td>
                    <td className="px-4 py-3 text-lg font-bold text-pink-600 bg-pink-50 rounded">{eventStats.byType.PHONE_USAGE || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* 지도 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">운행 경로 및 이벤트 지도</h3>
              <button
                onClick={fetchDriveExtraData}
                className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
              >새로고침</button>
            </div>
            {extraError && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
                부가 데이터 조회 실패: {extraError}
              </div>
            )}
            <KakaoMap
              polyline={driveLocations.map(loc => ({ lat: loc.latitude, lng: loc.longitude }))}
              markers={[
                // 이벤트 마커들
                ...driveEvents.map(ev => ({
                  lat: ev.latitude,
                  lng: ev.longitude,
                  imageSrc:
                    ev.eventType === 'DROWSINESS' ? 'https://cdn-icons-png.flaticon.com/512/565/565547.png' :
                    ev.eventType === 'ACCELERATION' ? 'https://cdn-icons-png.flaticon.com/512/565/565604.png' :
                    ev.eventType === 'BRAKING' ? 'https://cdn-icons-png.flaticon.com/512/565/565606.png' :
                    ev.eventType === 'SMOKING' ? 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png' :
                    ev.eventType === 'SEATBELT_UNFASTENED' ? 'https://cdn-icons-png.flaticon.com/512/2919/2919906.png' :
                    ev.eventType === 'PHONE_USAGE' ? 'https://cdn-icons-png.flaticon.com/512/15047/15047587.png' :
                    undefined,
                })),
              ]}
              height="340px"
            />
          </div>
          {/* 상세 이벤트 이력 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">상세 이벤트 이력</h3>
            {driveEvents.length === 0 ? (
              <p className="text-gray-400 text-center py-8">이 배차에서 발생한 이벤트가 없습니다.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto pr-2">
                <div className="space-y-3">
                  {driveEvents
                    .sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime))
                    .map((ev, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                ev.eventType === 'DROWSINESS' ? 'bg-red-50 text-red-700' :
                                ev.eventType === 'ACCELERATION' ? 'bg-yellow-50 text-yellow-700' :
                                ev.eventType === 'BRAKING' ? 'bg-orange-50 text-orange-700' :
                                ev.eventType === 'SMOKING' ? 'bg-purple-50 text-purple-700' :
                                ev.eventType === 'SEATBELT_UNFASTENED' ? 'bg-blue-50 text-blue-700' :
                                ev.eventType === 'PHONE_USAGE' ? 'bg-pink-50 text-pink-700' :
                                'bg-gray-50 text-gray-700'
                              }`}>
                                {ev.eventType === "DROWSINESS" ? "졸음운전" :
                                 ev.eventType === "ACCELERATION" ? "급가속" :
                                 ev.eventType === "BRAKING" ? "급제동" :
                                 ev.eventType === "SMOKING" ? "흡연" :
                                 ev.eventType === "SEATBELT_UNFASTENED" ? "안전벨트 미착용" :
                                 ev.eventType === "PHONE_USAGE" ? "휴대폰 사용" :
                                 ev.eventType}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{ev.description}</p>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            {new Date(ev.eventTime).toLocaleString('ko-KR')}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default DriveDetail;
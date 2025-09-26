import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoBus, IoPersonCircle, IoWarning, IoStatsChart, IoArrowBack } from "react-icons/io5";
import axios from "axios";
import { useDriverAPI } from "../hooks/useDriverAPI";
import { useDriverDispatchAPI } from "../hooks/useDriverDispatchAPI";
import { useToken } from "../components/Token/TokenProvider";

const DriveDetail = ({ onBackToInsight }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchDriverDetail } = useDriverAPI();
  const { fetchMyDispatchById, startMyDispatch, endMyDispatch } = useDriverDispatchAPI();
  const { getToken, getUserInfo } = useToken();
  
  const [driveData, setDriveData] = useState(null);
  const [warningStats, setWarningStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🔍 useEffect 실행됨, id:", id);
    if (!id) {
      console.log("❌ ID가 없어서 API 호출하지 않음");
      return;
    }
    console.log("✅ API 호출 시작");
    fetchDriveDetail();
  }, [id]);

  const fetchDriveDetail = async () => {
    try {
      console.log("🚀 DriveDetail 데이터 로딩 시작, ID:", id);
      
      // 사용자 권한 확인
      const userInfo = getUserInfo();
      const userRole = userInfo?.role || 'UNKNOWN';
      console.log("👤 현재 사용자 권한:", userRole);
      
      let dispatchData = null;
      
      if (userRole === 'DRIVER') {
        // 운전자인 경우: 본인 배차 정보 조회
        console.log("📋 1단계: 운전자 배차 정보 조회 중...");
        dispatchData = await fetchMyDispatchById(id);
      } else {
        // 관리자인 경우: 관리자용 배차 정보 조회 API 사용
        console.log("📋 1단계: 관리자용 배차 정보 조회 중...");
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
          console.error("관리자 API 호출 실패, 운전자 API 시도:", adminError);
          // 관리자 API 실패시 운전자 API로 폴백
          dispatchData = await fetchMyDispatchById(id);
        }
      }
      
      console.log("✅ 배차 정보 응답:", dispatchData);
      
      if (!dispatchData) {
        throw new Error('배차 정보를 찾을 수 없습니다.');
      }
      
      // 2단계: 운전자 정보 가져오기 (현재 로그인한 사용자의 정보)
      const driverId = dispatchData.driverId;
      console.log("👤 2단계: 운전자 정보 조회 중, driverId:", driverId);
      const driverResponse = await fetchDriverDetail(driverId);
      console.log("✅ 운전자 정보 응답:", driverResponse);
      
      // 3단계: 버스 정보 가져오기 (JWT 토큰 포함)
      const busId = dispatchData.busId;
      console.log("🚌 3단계: 버스 정보 조회 중, busId:", busId);
      
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const busResponse = await axios.get(`/api/admin/buses/${busId}`, { headers });
      console.log("✅ 버스 정보 응답:", busResponse.data);
      
      // 4단계: 경고 정보 가져오기 (임시로 비활성화 - API 미구현)
      console.log("⚠️ 4단계: 경고 정보 조회 (API 미구현으로 임시 데이터 사용)");
      let warnings = [];
      let stats = { total: 0, critical: 0, warning: 0, info: 0 };
      
      try {
        // 경고 API 호출 (올바른 엔드포인트 사용)
        const warningsResponse = await axios.get(`/api/warnings?dispatchId=${id}`, { headers });
        console.log("✅ 경고 정보 응답:", warningsResponse.data);
        warnings = warningsResponse.data?.data || warningsResponse.data || [];
        stats = calculateWarningStats(warnings);
      } catch (warningError) {
        console.log("⚠️ 경고 API 호출 실패 (정상 - API 미구현):", warningError.response?.status);
        // 임시 더미 데이터 사용
        warnings = [];
        stats = {
          total: 0,
          acceleration: 0,
          drowsiness: 0,
          braking: 0,
          abnormal: 0,
          critical: 0,
          warning: 0,
          info: 0
        };
      }

      const finalData = {
        dispatch: dispatchData,
        driver: driverResponse,
        bus: busResponse.data?.data || busResponse.data
      };
      
      console.log("🎉 모든 데이터 로딩 완료:", finalData);
      console.log("📋 배차 데이터:", dispatchData);
      console.log("👤 운전자 데이터:", driverResponse);
      console.log("🚌 버스 데이터:", busResponse.data?.data || busResponse.data);
      
      setDriveData(finalData);
      setWarningStats(stats);
      setAlerts(warnings);
      setError(null);
    } catch (err) {
      console.error("❌ 운행 상세 정보 로딩 실패:", err);
      console.error("❌ 에러 상세:", err.response?.data || err.message);
      
      // 403 에러 특별 처리
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
      setWarningStats(null);
      setAlerts([]);
    } finally {
      setLoading(false);
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

  // 경고 통계 계산 함수
  const calculateWarningStats = (warnings) => {
    const stats = {
      total: warnings.length,
      byType: {},
      timeDistribution: {}
    };

    warnings.forEach(warning => {
      // 타입별 통계
      stats.byType[warning.warningType] = (stats.byType[warning.warningType] || 0) + 1;
      
      // 시간대별 통계 (시간 단위)
      const hour = new Date(warning.warningTime).getHours();
      const timeSlot = `${hour}:00-${hour + 1}:00`;
      stats.timeDistribution[timeSlot] = (stats.timeDistribution[timeSlot] || 0) + 1;
    });

    return stats;
  };

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
            
            {/* 날짜 강조 */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r">
                            <div className="text-sm text-blue-600">운행 날짜</div>
              <div className="text-lg font-bold text-blue-700">{driveData.dispatch.dispatchDate || driveData.dispatch.scheduledDeparture?.split('T')[0] || '날짜 없음'}</div>
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
                <span className="font-semibold text-gray-900">{driveData.dispatch.scheduledDeparture}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm">실제 출발</span>
                <span className="font-semibold text-gray-900">{driveData.dispatch.actualDeparture || "미출발"}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm">실제 도착</span>
                <span className="font-semibold text-gray-900">{driveData.dispatch.actualArrival || "미도착"}</span>
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
        <div className="lg:col-span-3">
          {/* 통합 패널 - 이상감지 통계 + 상세 경고 이력 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 h-full">
            {/* 이상감지 통계 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">이상감지 통계</h3>
              
              {/* 전체 통계 - 동일한 크기 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-6 bg-blue-50 rounded-lg h-24 flex flex-col justify-center">
                    <div className="text-3xl font-bold text-blue-600">{warningStats?.total || 0}</div>
                    <div className="text-gray-600 text-sm">총 경고 건수</div>
                  </div>
                  <div className="text-center p-6 bg-red-50 rounded-lg h-24 flex flex-col justify-center">
                    <div className="text-3xl font-bold text-red-600">
                      {warningStats?.byType?.Drowsiness || 0}
                    </div>
                    <div className="text-gray-600 text-sm">졸음운전</div>
                  </div>
                  <div className="text-center p-6 bg-yellow-50 rounded-lg h-24 flex flex-col justify-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {warningStats?.byType?.Acceleration || 0}
                    </div>
                    <div className="text-gray-600 text-sm">급가속</div>
                  </div>
                  <div className="text-center p-6 bg-orange-50 rounded-lg h-24 flex flex-col justify-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {warningStats?.byType?.Braking || 0}
                    </div>
                    <div className="text-gray-600 text-sm">급제동</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-100 mb-6"></div>

            {/* 상세 경고 이력 */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4">상세 경고 이력</h3>
              
              {alerts.length === 0 ? (
                <p className="text-gray-400 text-center py-8">이 배차에서 발생한 경고가 없습니다.</p>
              ) : (
                <div className="max-h-80 overflow-y-auto pr-2">
                  <div className="space-y-3">
                    {alerts
                      .sort((a, b) => new Date(a.warningTime) - new Date(b.warningTime))
                      .map((alert, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  alert.warningType === 'Drowsiness' ? 'bg-red-50 text-red-700' :
                                  alert.warningType === 'Acceleration' ? 'bg-yellow-50 text-yellow-700' :
                                  alert.warningType === 'Braking' ? 'bg-orange-50 text-orange-700' :
                                  alert.warningType === 'Abnormal' ? 'bg-purple-50 text-purple-700' :
                                  'bg-gray-50 text-gray-700'
                                }`}>
                                  {alert.warningType === "Drowsiness" ? "졸음운전" :
                                   alert.warningType === "Acceleration" ? "급가속" :
                                   alert.warningType === "Braking" ? "급제동" :
                                   alert.warningType === "Abnormal" ? "이상감지" :
                                   alert.warningType}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm">{alert.description}</p>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              {new Date(alert.warningTime).toLocaleString('ko-KR')}
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
    </div>
  );
};


export default DriveDetail;
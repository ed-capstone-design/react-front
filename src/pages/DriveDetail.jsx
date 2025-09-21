import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoBus, IoPersonCircle, IoWarning, IoStatsChart, IoArrowBack } from "react-icons/io5";
import axios from "axios";

const DriveDetail = ({ onBackToInsight }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driveData, setDriveData] = useState(null);
  const [warningStats, setWarningStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetchDriveDetail();
  }, [id]);

  const fetchDriveDetail = async () => {
    try {
      // 배차 정보와 드라이버, 버스 정보 가져오기
      const dispatchResponse = await axios.get(`/api/dispatch/${id}`);
      const driverResponse = await axios.get(`/api/drivers/${dispatchResponse.data.driverId}`);
      const busResponse = await axios.get(`/api/buses/${dispatchResponse.data.busId}`);
      
      // 해당 배차의 경고 정보 가져오기
      const warningsResponse = await axios.get(`/api/warnings/dispatch/${id}`);

      // 경고 통계 계산
      const warnings = warningsResponse.data || [];
      const stats = calculateWarningStats(warnings);

      setDriveData({
        dispatch: dispatchResponse.data,
        driver: driverResponse.data,
        bus: busResponse.data
      });
      setWarningStats(stats);
      setAlerts(warnings);
      setError(null);
    } catch (err) {
      console.error("운행 상세 정보 로딩 실패:", err);
      setError("데이터를 불러올 수 없습니다.");
      // 에러 시 목업 데이터로 대체
      setDriveData({
        dispatch: { 
          dispatchId: id, 
          status: "COMPLETED", 
          dispatchDate: "2024-01-15",
          scheduledDeparture: "08:00",
          actualDeparture: "08:02", 
          actualArrival: "16:30",
          drivingScore: 85
        },
        driver: { 
          name: "김운전", 
          phoneNumber: "010-1234-5678", 
          licenseType: "1종 보통" 
        },
        bus: { 
          plateNumber: "서울 12가 3456", 
          busNumber: "101", 
          status: "ACTIVE" 
        }
      });

      // 목업 경고 데이터
      const mockWarnings = [
        { 
          warningTime: "2024-01-15T08:15:00", 
          warningType: "Acceleration", 
        },
        { 
          warningTime: "2024-01-15T09:30:00", 
          warningType: "Drowsiness", 

        },
        { 
          warningTime: "2024-01-15T10:45:00", 
          warningType: "Braking", 
        },
        { 
          warningTime: "2024-01-15T11:20:00", 
          warningType: "Acceleration", 

        },
        { 
          warningTime: "2024-01-15T12:15:00", 
          warningType: "Drowsiness", 

        },
        { 
          warningTime: "2024-01-15T13:35:00", 
          warningType: "Abnormal", 

        },
        { 
          warningTime: "2024-01-15T14:10:00", 
          warningType: "Braking", 

        },
        { 
          warningTime: "2024-01-15T14:45:00", 
          warningType: "Acceleration", 

        },
        { 
          warningTime: "2024-01-15T15:25:00", 
          warningType: "Drowsiness", 

        },
        { 
          warningTime: "2024-01-15T16:05:00", 
          warningType: "Braking", 

        }
      ];
      
      setAlerts(mockWarnings);
      setWarningStats(calculateWarningStats(mockWarnings));
    } finally {
      setLoading(false);
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
              <div className="text-lg font-bold text-blue-700">{driveData.dispatch.dispatchDate}</div>
            </div>

            {/* 운전자 정보 */}
            <div className="border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <IoPersonCircle className="text-blue-500 text-2xl" />
                <div>
                  <div className="font-bold text-gray-900">{driveData.driver.name}</div>

                </div>
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                {driveData.driver.phoneNumber}
              </div>
            </div>

            {/* 버스 정보 */}
            <div className="border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <IoBus className="text-green-500 text-2xl" />
                <div>
                  <div className="font-bold text-gray-900">{driveData.bus.plateNumber}</div>
                  <div className="text-sm text-gray-500">{driveData.bus.busNumber}번 노선</div>
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
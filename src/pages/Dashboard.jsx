import React from "react";
import { 
  IoCarSportOutline, 
  IoPeopleOutline, 
  IoStatsChartOutline, 
  IoNotificationsOutline, 
  IoBusOutline,
  IoTimerOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoArrowForwardOutline
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useDashboardData7d } from "../hooks/useDashboardData7d";

const DashboardContent = () => {
  const navigate = useNavigate();
  const { loading, kpiCounts, todayDispatches, dispatches7d } = useDashboardData7d();

  // 운행 상태별 분류
  const runningDispatches = todayDispatches.filter(d => d.status === 'RUNNING');
  const completedDispatches = todayDispatches.filter(d => d.status === 'COMPLETED');
  const scheduledDispatches = todayDispatches.filter(d => d.status === 'SCHEDULED');

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">운전의 진수</h1>
            <p className="text-lg text-gray-600">스마트 버스 운행 관리 시스템</p>
            <p className="text-sm text-gray-500 mt-2">실시간 운행 모니터링 · 배차 관리 · 운전자 관리를 한 곳에서</p>
          </div>
        </div>

        {/* 핵심 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 총 배차</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? "—" : kpiCounts.todayTotal}</p>
              </div>
              <IoCarSportOutline className="text-3xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">운행 중</p>
                <p className="text-2xl font-bold text-green-600">{loading ? "—" : runningDispatches.length}</p>
              </div>
              <IoStatsChartOutline className="text-3xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">등록 운전자</p>
                <p className="text-2xl font-bold text-purple-600">{loading ? "—" : kpiCounts.totalDrivers}</p>
              </div>
              <IoPeopleOutline className="text-3xl text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">미읽은 알림</p>
                <p className="text-2xl font-bold text-orange-600">{loading ? "—" : kpiCounts.unreadNotifications}</p>
              </div>
              <IoNotificationsOutline className="text-3xl text-orange-500" />
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* 오늘의 운행 현황 */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">오늘의 운행 현황</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">데이터 로딩 중...</div>
              ) : todayDispatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">오늘 예정된 배차가 없습니다.</div>
              ) : (
                <div className="space-y-4">
                  {runningDispatches.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
                        <IoCheckmarkCircleOutline className="text-green-500" />
                        운행 중 ({runningDispatches.length}건)
                      </h4>
                      <div className="space-y-2">
                        {runningDispatches.slice(0, 3).map((dispatch) => (
                          <div key={dispatch.dispatchId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                              <IoBusOutline className="text-green-600" />
                              <div>
                                <p className="font-medium text-green-900">{dispatch.driverName || `운전자 ${dispatch.driverId}`}</p>
                                <p className="text-sm text-green-700">{dispatch.departureTime} - {dispatch.arrivalTime}</p>
                              </div>
                            </div>
                            <div className="text-sm text-green-600">
                              버스 {dispatch.busId}
                            </div>
                          </div>
                        ))}
                        {runningDispatches.length > 3 && (
                          <p className="text-xs text-green-600 text-center">외 {runningDispatches.length - 3}건 더</p>
                        )}
                      </div>
                    </div>
                  )}

                  {scheduledDispatches.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-blue-700 mb-3 flex items-center gap-2">
                        <IoTimerOutline className="text-blue-500" />
                        대기 중 ({scheduledDispatches.length}건)
                      </h4>
                      <div className="space-y-2">
                        {scheduledDispatches.slice(0, 2).map((dispatch) => (
                          <div key={dispatch.dispatchId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              <IoTimerOutline className="text-blue-600" />
                              <div>
                                <p className="font-medium text-blue-900">{dispatch.driverName || `운전자 ${dispatch.driverId}`}</p>
                                <p className="text-sm text-blue-700">{dispatch.departureTime} 출발 예정</p>
                              </div>
                            </div>
                            <div className="text-sm text-blue-600">
                              버스 {dispatch.busId}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className="space-y-6">
            {/* 주요 기능 바로가기 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">주요 기능</h3>
              </div>
              <div className="p-4 space-y-3">
                <button 
                  onClick={() => navigate('/operating-schedule')}
                  className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <IoCarSportOutline className="text-blue-600" />
                    <span className="font-medium text-blue-900">배차 관리</span>
                  </div>
                  <IoArrowForwardOutline className="text-blue-600" />
                </button>

                <button 
                  onClick={() => navigate('/drivers')}
                  className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <IoPeopleOutline className="text-purple-600" />
                    <span className="font-medium text-purple-900">운전자 관리</span>
                  </div>
                  <IoArrowForwardOutline className="text-purple-600" />
                </button>

                <button 
                  onClick={() => navigate('/buses')}
                  className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <IoBusOutline className="text-green-600" />
                    <span className="font-medium text-green-900">버스 관리</span>
                  </div>
                  <IoArrowForwardOutline className="text-green-600" />
                </button>

                <button 
                  onClick={() => navigate('/insight')}
                  className="w-full flex items-center justify-between p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <IoNotificationsOutline className="text-orange-600" />
                    <span className="font-medium text-orange-900">알림 확인</span>
                  </div>
                  <IoArrowForwardOutline className="text-orange-600" />
                </button>
              </div>
            </div>

            {/* 주간 요약 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">이번 주 요약</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IoCarSportOutline className="text-blue-500" />
                    <span className="text-sm text-gray-600">총 배차</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{dispatches7d.length}건</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IoPeopleOutline className="text-purple-500" />
                    <span className="text-sm text-gray-600">활동 운전자</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {new Set(dispatches7d.map(d => d.driverId)).size}명
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IoBusOutline className="text-green-500" />
                    <span className="text-sm text-gray-600">운행 버스</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {new Set(dispatches7d.map(d => d.busId)).size}대
                  </span>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>최근 7일 기준</span>
                    <span>매일 평균 {Math.round(dispatches7d.length / 7)}건</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        {completedDispatches.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">오늘 완료된 운행 ({completedDispatches.length}건)</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedDispatches.slice(0, 6).map((dispatch) => (
                  <div key={dispatch.dispatchId} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <IoCheckmarkCircleOutline className="text-green-500" />
                      <span className="font-medium text-gray-900">{dispatch.driverName || `운전자 ${dispatch.driverId}`}</span>
                    </div>
                    <p className="text-sm text-gray-600">{dispatch.departureTime} - {dispatch.arrivalTime}</p>
                    <p className="text-sm text-gray-500">버스 {dispatch.busId}</p>
                  </div>
                ))}
              </div>
              {completedDispatches.length > 6 && (
                <div className="text-center mt-4">
                  <button 
                    onClick={() => navigate('/operating-schedule')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    전체 보기 →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => <DashboardContent />;

export default Dashboard;
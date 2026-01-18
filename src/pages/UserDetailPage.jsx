import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoPersonCircle, IoArrowBack } from "react-icons/io5";
import axios from "axios";
import { useToast } from "../components/Toast/ToastProvider";

import { authManager } from "../components/Token/authManager";


// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

const UserDetailPage = () => {
  const { id } = useParams(); // URL에서 사용자 ID 가져오기
  const navigate = useNavigate();
  const toast = useToast();
  const getToken = () => authManager.getToken();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 운전자 기본 정보 상태
  const [username, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [careerYears, setCareerYears] = useState("");
  const [avgDrivingScore, setAvgDrivingScore] = useState("");
  const [grade, setGrade] = useState("");

  const [dispatchHistory, setDispatchHistory] = useState([]);
  const [warningHistory, setWarningHistory] = useState([]);
  const [dispatchStats, setDispatchStats] = useState({
    total: 0,
    completed: 0,
    scheduled: 0,
    cancelled: 0,
    delayed: 0
  });
  const [warningStats, setWarningStats] = useState({
    total: 0,
    byType: {},
    thisMonth: 0
  });
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  // 입력 바인딩용 보류 상태
  const [pendingDateRange, setPendingDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [warningDateRange, setWarningDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  // 입력 바인딩용 보류 상태
  const [pendingWarningDateRange, setPendingWarningDateRange] = useState({
    startDate: "",
    endDate: ""
  });

  // 페이지네이션 상태
  const [dispatchPage, setDispatchPage] = useState(1);
  const [warningPage, setWarningPage] = useState(1);
  const itemsPerPage = 5;

  // 페이지네이션 표시용 헬퍼: 현재 페이지 기준으로 블록(예: 5개) 단위로 페이지 버튼을 보여줌
  const getVisiblePages = (current, total, blockSize = 5) => {
    const totalPages = Math.max(1, Math.ceil(total));
    const blockIndex = Math.floor((current - 1) / blockSize);
    const start = blockIndex * blockSize + 1;
    const end = Math.min(start + blockSize - 1, totalPages);
    const pages = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return { pages, start, end, totalPages };
  };

  // 이번달 첫날과 마지막날 계산
  const getThisMonthDateRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    };
  };

  // 1. 운전자 정보 API - 운전자 기본 정보 조회
  const fetchUserData = async (userId) => {
    try {
      console.log(`👤 [UserDetailPage] 운전자 ${userId} 정보 조회 시작`);

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // 실제 API 호출
      const response = await axios.get(`/api/admin/drivers/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`👤 [UserDetailPage] 운전자 ${userId} 정보 응답:`, response.data);
      const driverData = response.data?.data || response.data;
      setUserName(driverData.username || "");
      // 휴대폰 번호를 프로필 표시에 사용
      setPhoneNumber(
        driverData.phoneNumber ||
        driverData.phone ||
        driverData.mobile ||
        driverData.contactPhone ||
        driverData.contact?.phoneNumber ||
        ""
      );
      setLicenseNumber(driverData.licenseNumber || "");
      setCareerYears(driverData.careerYears || "");
      setAvgDrivingScore(driverData.avgDrivingScore || "");
      setGrade(driverData.grade || "");

      console.log("✅ 운전자 정보 로드 완료");
      return driverData;
    } catch (error) {
      console.error("❌ 운전자 정보 로딩 실패:", error);
      if (error.response?.status === 401) {
        toast.error("인증이 필요합니다. 다시 로그인해주세요.");
      } else if (error.response?.status === 403) {
        toast.error("관리자 권한이 필요합니다.");
      } else if (error.response?.status === 404) {
        toast.error("해당 운전자를 찾을 수 없습니다.");
      } else {
        toast.error(error.response?.data?.message || "운전자 정보를 불러오지 못했습니다.");
      }
      throw error; // 실패시 에러 throw
    }
  };

  // 2. 배차 이력 API - 운전자의 배차 기록 조회
  const loadDispatchHistory = async (userId) => {
    try {
      console.log(`📅 [UserDetailPage] 운전자 ${userId} 배차 이력 조회 시작`);
      // 실제 API 호출 - 관리자가 특정 운전자의 배차 이력 조회
      const { driverService } = await import('../api/ServiceLayer/driverService');
      const startDate = dateRange.startDate || null;
      const endDate = dateRange.endDate || null;

      const history = await driverService.getDriverDispatch(userId, startDate, endDate);
      setDispatchHistory(history || []);

      // 배차 통계 계산
      const stats = {
        total: history?.length || 0,
        completed: 0,
        scheduled: 0,
        cancelled: 0,
        delayed: 0
      };

      history?.forEach(dispatch => {
        const st = String(dispatch.status ?? '').toUpperCase();
        if (st === 'COMPLETED') stats.completed++;
        else if (st === 'SCHEDULED') stats.scheduled++;
        else if (st === 'CANCELED' || st === 'CANCELLED') stats.cancelled++;
        else if (st === 'DELAYED') stats.delayed++;
        // other statuses (RUNNING, IN_PROGRESS, etc.) are not included in the summary counts here
      });

      setDispatchStats(stats);
      console.log("✅ 배차 이력 로드 완료:", history?.length || 0, "건");
    } catch (error) {
      console.error("❌ 배차 이력 조회 실패:", error);
      if (error.response?.status === 401) {
        toast.error("인증이 필요합니다. 다시 로그인해주세요.");
      } else if (error.response?.status === 403) {
        toast.error("관리자 권한이 필요합니다.");
      } else {
        toast.error(error.response?.data?.message || "배차 이력을 불러올 수 없습니다.");
      }
      setDispatchHistory([]); // 실패 시 빈 배열로 초기화
      setDispatchStats({ total: 0, completed: 0, scheduled: 0, cancelled: 0, delayed: 0 });
    }
  };

  // 3. 경고 이력 API - 운전자의 경고 기록 조회 (날짜 범위 지원)
  const loadWarningHistory = async (userId) => {
    try {
      console.log(`⚠️ [UserDetailPage] 운전자 ${userId} 경고 이력 조회 시작`);

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // 실제 API 호출 - 백엔드 API 엔드포인트를 `/api/admin/drivers/{driverId}/events`로 변경
      const params = {};
      if (warningDateRange.startDate) params.startDate = warningDateRange.startDate;
      if (warningDateRange.endDate) params.endDate = warningDateRange.endDate;

      const response = await axios.get(`/api/admin/drivers/${userId}/events`, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`⚠️ [UserDetailPage] 운전자 ${userId} 경고 이력 응답:`, response.data);
      const raw = response.data?.data || response.data || [];
      // 정규화: 백엔드가 다양한 필드명(eventTimestamp/eventTime/warningTime 등)을 보낼 수 있으므로 일관된 필드로 매핑
      const warnings = (Array.isArray(raw) ? raw : []).map(w => normalizeEvent(w));
      setWarningHistory(warnings);

      // 경고 통계 계산
      const stats = {
        total: warnings.length,
        byType: {},
        thisMonth: 0
      };

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      warnings.forEach(warning => {
        // 타입별 통계 (정규화된 eventType 사용)
        const eventType = warning.eventType;
        stats.byType[eventType] = (stats.byType[eventType] || 0) + 1;

        // 이번 달 통계
        const warningDate = new Date(warning.eventTimestamp || warning.eventTime || warning.warningTime || warning.timestamp);
        if (!isNaN(warningDate) && warningDate.getMonth() === currentMonth && warningDate.getFullYear() === currentYear) {
          stats.thisMonth++;
        }
      });

      setWarningStats(stats);
      console.log("✅ 경고 이력 로드 완료:", warnings.length, "건");
    } catch (error) {
      console.error("❌ 경고 이력 조회 실패:", error);
      toast.error("경고 이력을 불러올 수 없습니다.");
      setWarningHistory([]); // 실패 시 빈 배열로 초기화
      setWarningStats({ total: 0, byType: {}, thisMonth: 0 });
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);

      // 이번달 날짜 범위를 기본값으로 설정 (자동 조회하지 않음)
      const thisMonthRange = getThisMonthDateRange();
      setPendingDateRange(thisMonthRange);
      setPendingWarningDateRange(thisMonthRange);

      // 운전자 정보만 먼저 호출
      fetchUserData(id)
        .then((driverData) => {
          console.log("운전자 정보 로드 완료. 배차/경고 이력은 사용자가 조회 버튼을 눌러 조회하세요.");
        })
        .catch((error) => {
          console.error("운전자 정보 로딩 실패:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // ID가 없으면 오류 처리
      setError("사용자 ID가 제공되지 않았습니다.");
      setLoading(false);
    }
  }, [id]);

  // 자동 로딩을 제거하고 사용자가 직접 조회하도록 변경

  // 배차 이력 날짜 범위 변경 핸들러
  const handleApplyDateRange = async () => {
    const newRange = { ...pendingDateRange };
    setDateRange(newRange);
    setDispatchPage(1); // 페이지를 1페이지로 리셋

    // 즉시 조회
    if (id) {
      try {
        const { driverService } = await import('../api/ServiceLayer/driverService');
        const startDate = newRange.startDate || null;
        const endDate = newRange.endDate || null;

        const history = await driverService.getDriverDispatch(id, startDate, endDate);
        setDispatchHistory(history || []);

        // 배차 통계 계산
        const stats = {
          total: history?.length || 0,
          completed: 0,
          scheduled: 0,
          cancelled: 0,
          delayed: 0
        };

        history?.forEach(dispatch => {
          const st = String(dispatch.status ?? '').toUpperCase();
          if (st === 'COMPLETED') stats.completed++;
          else if (st === 'SCHEDULED') stats.scheduled++;
          else if (st === 'CANCELED' || st === 'CANCELLED') stats.cancelled++;
          else if (st === 'DELAYED') stats.delayed++;
        });

        setDispatchStats(stats);
      } catch (error) {
        console.error("배차 이력 조회 실패:", error);
        setDispatchHistory([]);
        setDispatchStats({ total: 0, completed: 0, scheduled: 0, cancelled: 0, delayed: 0 });
      }
    }
  };

  // 경고 이력 날짜 범위 변경 핸들러
  const handleApplyWarningDateRange = () => {
    const newRange = { ...pendingWarningDateRange };
    setWarningDateRange(newRange);
    setWarningPage(1); // 페이지를 1페이지로 리셋

    // 즉시 조회
    if (id) {
      const token = getToken();
      const params = {};
      if (newRange.startDate) params.startDate = newRange.startDate;
      if (newRange.endDate) params.endDate = newRange.endDate;

      axios.get(`/api/admin/drivers/${id}/events`, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(response => {
        const raw = response.data?.data || response.data || [];
        const warnings = (Array.isArray(raw) ? raw : []).map(w => normalizeEvent(w));
        setWarningHistory(warnings);

        // 경고 통계 계산
        const stats = {
          total: warnings.length,
          byType: {},
          thisMonth: 0
        };

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        warnings.forEach(warning => {
          const eventType = warning.eventType;
          stats.byType[eventType] = (stats.byType[eventType] || 0) + 1;

          const warningDate = new Date(warning.eventTimestamp || warning.eventTime || warning.warningTime);
          if (!isNaN(warningDate) && warningDate.getMonth() === currentMonth && warningDate.getFullYear() === currentYear) {
            stats.thisMonth++;
          }
        });

        setWarningStats(stats);
      }).catch(error => {
        console.error("경고 이력 조회 실패:", error);
        setWarningHistory([]);
        setWarningStats({ total: 0, byType: {}, thisMonth: 0 });
      });
    }
  };

  // 이벤트 정규화 헬퍼
  function normalizeEvent(raw) {
    if (!raw) return {};
    return {
      drivingEventId: raw.drivingEventId ?? raw.eventId ?? raw.id ?? null,
      dispatchId: raw.dispatchId ?? raw.refId ?? raw.relatedDispatchId ?? null,
      eventType: raw.eventType ?? raw.type ?? raw.warningType ?? 'UNKNOWN',
      eventTimestamp: raw.eventTimestamp ?? raw.eventTime ?? raw.warningTime ?? raw.timestamp ?? null,
      latitude: raw.latitude ?? raw.lat ?? raw.location?.latitude ?? null,
      longitude: raw.longitude ?? raw.lng ?? raw.location?.longitude ?? null,
      description: raw.description ?? raw.message ?? raw.detail ?? ''
    };
  }

  // 경고 타입 한글 변환 (새로운 DrivingEventType enum에 맞게 수정)
  const getWarningTypeLabel = (type) => {
    const types = {
      "DROWSINESS": "졸음운전",
      "ACCELERATION": "급가속",
      "BRAKING": "급제동",
      "SMOKING": "흡연",
      "SEATBELT_UNFASTENED": "안전벨트 미착용",
      "PHONE_USAGE": "휴대폰 사용",
      // 하위 호환성을 위한 이전 타입들
      "SPEEDING": "과속",
      "Drowsiness": "졸음운전",
      "Acceleration": "급가속",
      "Braking": "급제동",
      "Abnormal": "이상감지"
    };
    return types[type] || type;
  };

  // 로딩 상태 처리
  if (loading || !username) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-400">
            {loading ? "로딩중..." : "운전자 정보를 찾을 수 없습니다."}
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate('/drivers')}
        className="mb-4 flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <IoArrowBack className="text-lg" />
        <span className="font-medium">뒤로가기</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 좌측 프로필 패널 */}
        <div className="lg:col-span-1">
          {/* 운전자 정보 카드 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-6">
            <div className="text-center mb-6">
              <IoPersonCircle className="text-blue-500 text-7xl mx-auto mb-4 drop-shadow" />
              <div className="text-xl font-bold text-gray-900 mb-1">운전자 정보</div>
            </div>

            {/* 운전자 기본 정보 */}
            <div className="border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <IoPersonCircle className="text-blue-500 text-2xl" />
                <div>
                  <div className="font-bold text-gray-900">{username || "이름 없음"}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                {phoneNumber || "전화번호 없음"}
              </div>
            </div>

            {/* 운전자 상세 정보 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm">면허번호</span>
                <span className="font-semibold text-gray-900">
                  {licenseNumber || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm">경력</span>
                <span className="font-semibold text-gray-900">
                  {careerYears ? `${careerYears}년` : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm">등급</span>
                <span className="font-semibold text-gray-900">
                  {grade || "-"}
                </span>
              </div>
              {avgDrivingScore && (
                <div className="flex justify-between items-center py-2 mt-4 bg-green-50 px-3 rounded border-l-4 border-green-400">
                  <span className="text-green-700 text-sm font-medium">평균 점수</span>
                  <span className="font-bold text-green-800 text-lg">{avgDrivingScore}점</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 우측 메인 패널 */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* 배차 내역 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900">배차 내역</h3>
                {dispatchStats.total > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-50 px-3 py-1 rounded-full">
                      <span className="text-blue-800 font-bold">총 {dispatchStats.total}건</span>
                    </div>
                    <div className="bg-green-50 px-2 py-1 rounded-full">
                      <span className="text-green-800 text-xs font-medium">완료 {dispatchStats.completed}건</span>
                    </div>
                    <div className="bg-blue-50 px-2 py-1 rounded-full">
                      <span className="text-blue-800 text-xs font-medium">예정 {dispatchStats.scheduled}건</span>
                    </div>
                    {dispatchStats.cancelled > 0 && (
                      <div className="bg-red-50 px-2 py-1 rounded-full">
                        <span className="text-red-800 text-xs font-medium">취소 {dispatchStats.cancelled}건</span>
                      </div>
                    )}
                    {dispatchStats.delayed > 0 && (
                      <div className="bg-orange-50 px-2 py-1 rounded-full">
                        <span className="text-orange-800 text-xs font-medium">지연 {dispatchStats.delayed}건</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 날짜 필터 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작 날짜</label>
                  <input
                    type="date"
                    value={pendingDateRange.startDate}
                    onChange={(e) => setPendingDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료 날짜</label>
                  <input
                    type="date"
                    value={pendingDateRange.endDate}
                    onChange={(e) => setPendingDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2 flex md:justify-end">
                  <button
                    type="button"
                    onClick={handleApplyDateRange}
                    className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    조회
                  </button>
                </div>
              </div>
            </div>

            {dispatchHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-8">배차 이력이 없습니다.</p>
            ) : (
              <>
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-gray-600">번호</th>
                      <th className="py-2 px-4 text-gray-600">날짜</th>
                      <th className="py-2 px-4 text-gray-600">버스</th>
                      <th className="py-2 px-4 text-gray-600">상태</th>
                      <th className="py-2 px-4 text-gray-600">점수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dispatchHistory || [])
                      .slice((dispatchPage - 1) * itemsPerPage, dispatchPage * itemsPerPage)
                      .map((dispatch, index) => (
                        <tr key={`dispatch-${dispatch?.dispatchId || index}`} onClick={() => navigate(`/drivedetail/${dispatch.dispatchId}`)} className="hover:bg-blue-50 transition rounded cursor-pointer">
                          <td className="py-2 px-4 rounded-l">{(dispatchPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="py-2 px-4">{dispatch.dispatchDate}</td>
                          <td className="py-2 px-4">{dispatch.vehicleNumber}번</td>
                          <td className="py-2 px-4">
                            {
                              (() => {
                                const st = String(dispatch.status ?? '').toUpperCase();
                                let cls = 'bg-gray-50 text-gray-500';
                                let label = '대기';
                                if (st === 'COMPLETED') { cls = 'bg-green-50 text-green-700'; label = '완료'; }
                                else if (st === 'SCHEDULED') { cls = 'bg-blue-50 text-blue-700'; label = '예정'; }
                                else if (st === 'RUNNING' || st === 'IN_PROGRESS') { cls = 'bg-blue-50 text-blue-700'; label = '운행중'; }
                                else if (st === 'CANCELED' || st === 'CANCELLED') { cls = 'bg-red-50 text-red-700'; label = '취소'; }
                                else if (st === 'DELAYED') { cls = 'bg-orange-50 text-orange-700'; label = '지연'; }
                                return <span className={`px-2 py-1 rounded text-xs font-bold ${cls}`}>{label}</span>;
                              })()
                            }
                          </td>
                          <td className="py-2 px-4 rounded-r">{dispatch.drivingScore || "-"}점</td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {/* 배차 페이지네이션 */}
                {dispatchHistory.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      총 {dispatchHistory.length}개 중 {Math.min((dispatchPage - 1) * itemsPerPage + 1, dispatchHistory.length)}-{Math.min(dispatchPage * itemsPerPage, dispatchHistory.length)}개 표시
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDispatchPage(prev => Math.max(prev - 1, 1))}
                        disabled={dispatchPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      {(() => {
                        const totalPages = Math.ceil(dispatchHistory.length / itemsPerPage);
                        const { pages } = getVisiblePages(dispatchPage, totalPages, 5);
                        return pages.map(page => (
                          <button
                            key={page}
                            onClick={() => setDispatchPage(page)}
                            className={`px-3 py-1 text-sm border rounded ${page === dispatchPage
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {page}
                          </button>
                        ));
                      })()}
                      <button
                        onClick={() => setDispatchPage(prev => Math.min(prev + 1, Math.ceil(dispatchHistory.length / itemsPerPage)))}
                        disabled={dispatchPage === Math.ceil(dispatchHistory.length / itemsPerPage)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 경고 이력 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900">경고 이력</h3>
                {warningStats.total > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="bg-red-50 px-3 py-1 rounded-full">
                      <span className="text-red-800 font-bold">총 {warningStats.total}건</span>
                    </div>
                    {/* 타입별 통계 */}
                    {Object.entries(warningStats.byType || {})
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count], index) => (
                        <div key={`warning-stat-${type}-${index}`} className={`px-2 py-1 rounded-full ${type === 'DROWSINESS' ? 'bg-red-50' :
                          type === 'ACCELERATION' ? 'bg-yellow-50' :
                            type === 'BRAKING' ? 'bg-orange-50' :
                              type === 'SMOKING' ? 'bg-purple-50' :
                                type === 'SEATBELT_UNFASTENED' ? 'bg-blue-50' :
                                  type === 'PHONE_USAGE' ? 'bg-pink-50' :
                                    type === 'SPEEDING' ? 'bg-purple-50' :
                                      'bg-gray-50'
                          }`}>
                          <span className={`text-xs font-medium ${type === 'DROWSINESS' ? 'text-red-800' :
                            type === 'ACCELERATION' ? 'text-yellow-800' :
                              type === 'BRAKING' ? 'text-orange-800' :
                                type === 'SMOKING' ? 'text-purple-800' :
                                  type === 'SEATBELT_UNFASTENED' ? 'text-blue-800' :
                                    type === 'PHONE_USAGE' ? 'text-pink-800' :
                                      type === 'SPEEDING' ? 'text-purple-800' :
                                        'text-gray-800'
                            }`}>
                            {getWarningTypeLabel(type)} {count}건
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* 날짜 필터 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작 날짜</label>
                  <input
                    type="date"
                    value={pendingWarningDateRange.startDate}
                    onChange={(e) => setPendingWarningDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료 날짜</label>
                  <input
                    type="date"
                    value={pendingWarningDateRange.endDate}
                    onChange={(e) => setPendingWarningDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2 flex md:justify-end">
                  <button
                    type="button"
                    onClick={handleApplyWarningDateRange}
                    className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    조회
                  </button>
                </div>
              </div>
            </div>

            {warningHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-8">경고 이력이 없습니다.</p>
            ) : (
              <>
                <div className="space-y-3">
                  {(warningHistory || [])
                    .slice((warningPage - 1) * itemsPerPage, warningPage * itemsPerPage)
                    .map((warning, index) => {
                      // warning은 normalizeEvent를 통해 일관된 필드를 가짐
                      const eventType = warning.eventType || 'UNKNOWN';
                      const ts = warning.eventTimestamp || warning.eventTime || warning.warningTime || warning.timestamp;
                      const timeLabel = ts ? new Date(ts).toLocaleString('ko-KR') : '—';
                      return (
                        <div
                          key={`warning-${warning?.drivingEventId || warning?.warningId || index}`}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => {
                            // dispatchId는 0일 수도 있고 빈 문자열이 아닐 수도 있으므로
                            // 단순 truthy 검사로는 실패할 수 있습니다. 명시적으로 null/undefined 검사 후 이동합니다.
                            const did = (warning && (warning.dispatchId !== undefined && warning.dispatchId !== null)) ? warning.dispatchId : null;
                            if (did !== null) {
                              navigate(`/drivedetail/${did}`);
                            } else {
                              toast.info('이 경고에 연결된 배차 정보가 없습니다.');
                            }
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${eventType === 'DROWSINESS' ? 'bg-red-50 text-red-700' :
                                eventType === 'ACCELERATION' ? 'bg-yellow-50 text-yellow-700' :
                                  eventType === 'BRAKING' ? 'bg-orange-50 text-orange-700' :
                                    eventType === 'SMOKING' ? 'bg-purple-50 text-purple-700' :
                                      eventType === 'SEATBELT_UNFASTENED' ? 'bg-blue-50 text-blue-700' :
                                        eventType === 'PHONE_USAGE' ? 'bg-pink-50 text-pink-700' :
                                          eventType === 'SPEEDING' ? 'bg-purple-50 text-purple-700' :
                                            'bg-gray-50 text-gray-700'
                                }`}>{getWarningTypeLabel(eventType)}</span>
                              <div className="text-gray-700 text-sm">{warning.description}</div>
                            </div>
                            <div className="text-right text-xs text-gray-500">{timeLabel}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* 경고 페이지네이션 */}
                {warningHistory.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      총 {warningHistory.length}개 중 {Math.min((warningPage - 1) * itemsPerPage + 1, warningHistory.length)}-{Math.min(warningPage * itemsPerPage, warningHistory.length)}개 표시
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setWarningPage(prev => Math.max(prev - 1, 1))}
                        disabled={warningPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      {(() => {
                        const totalPages = Math.ceil(warningHistory.length / itemsPerPage);
                        const { pages } = getVisiblePages(warningPage, totalPages, 5);
                        return pages.map(page => (
                          <button
                            key={page}
                            onClick={() => setWarningPage(page)}
                            className={`px-3 py-1 text-sm border rounded ${page === warningPage
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {page}
                          </button>
                        ));
                      })()}
                      <button
                        onClick={() => setWarningPage(prev => Math.min(prev + 1, Math.ceil(warningHistory.length / itemsPerPage)))}
                        disabled={warningPage === Math.ceil(warningHistory.length / itemsPerPage)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
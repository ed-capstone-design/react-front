import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoPersonCircle, IoArrowBack } from "react-icons/io5";
import axios from "axios";
import { useToast } from "../components/Toast/ToastProvider";
import { useScheduleAPI } from "../hooks/useScheduleAPI";
import { useToken } from "../components/Token/TokenProvider";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

const UserDetailPage = () => {
  const { id } = useParams(); // URL에서 사용자 ID 가져오기
  const navigate = useNavigate();
  const toast = useToast();
  const { fetchSchedulesByDriver } = useScheduleAPI();
  const { getToken } = useToken();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const options = {};
      if (dateRange.startDate) options.startDate = dateRange.startDate;
      if (dateRange.endDate) options.endDate = dateRange.endDate;
      
      const history = await fetchSchedulesByDriver(userId, options);
      setDispatchHistory(history || []);
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

      // 실제 API 호출
  const params = {};
      if (warningDateRange.startDate) params.startDate = warningDateRange.startDate;
      if (warningDateRange.endDate) params.endDate = warningDateRange.endDate;
      
      const response = await axios.get(`/api/warnings/driver/${userId}`, { 
        params,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`⚠️ [UserDetailPage] 운전자 ${userId} 경고 이력 응답:`, response.data);
      const warnings = response.data?.data || response.data || [];
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
        // 타입별 통계
        stats.byType[warning.warningType] = (stats.byType[warning.warningType] || 0) + 1;
        
        // 이번 달 통계
        const warningDate = new Date(warning.warningTime);
        if (warningDate.getMonth() === currentMonth && warningDate.getFullYear() === currentYear) {
          stats.thisMonth++;
        }
      });
      
      setWarningStats(stats);
      console.log("✅ 경고 이력 로드 완료:", warnings.length, "건");
    } catch (error) {
      console.error("❌ 경고 이력 조회 실패:", error);
      toast.error("경고 이력을 불러올 수 없습니다.");
      setWarningHistory([]); // 실패 시 빈 배열로 초기화
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      
      // 1단계: 운전자 정보 먼저 호출
      fetchUserData(id)
        .then((driverData) => {
          // 운전자 정보 성공 시 배차/경고 이력 병렬 호출
          console.log("운전자 정보 성공, 배차/경고 이력 조회 시작");
          return Promise.all([
            loadDispatchHistory(id),     // 배차 이력
            loadWarningHistory(id)       // 경고 이력
          ]);
        })
        .catch((error) => {
          // 운전자 정보 실패시 여기서 끝 (토스트는 fetchUserData에서 이미 표시됨)
          console.error("운전자 정보 로딩 실패로 인한 전체 로딩 중단:", error);
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

  // 배차 이력 날짜 범위 변경시만 배차 이력 다시 로드
  useEffect(() => {
    if (id && username) { // 운전자 정보가 로드된 후에만 실행
      loadDispatchHistory(id);
    }
  }, [dateRange]);

  // 경고 이력 날짜 범위 변경시만 경고 이력 다시 로드
  useEffect(() => {
    if (id && username) { // 운전자 정보가 로드된 후에만 실행
      loadWarningHistory(id);
    }
  }, [warningDateRange]);

  // 배차 이력 날짜 범위 변경 핸들러
  const handleApplyDateRange = () => {
    setDateRange({ ...pendingDateRange });
  };

  // 경고 이력 날짜 범위 변경 핸들러
  const handleApplyWarningDateRange = () => {
    setWarningDateRange({ ...pendingWarningDateRange });
  };

  // 경고 타입 한글 변환-> 수정해야됨
  const getWarningTypeLabel = (type) => {
    const types = {
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
      {/* 돌아가기 버튼 */}
      <button
        onClick={() => navigate('/drivers')}
        className="mb-4 flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <IoArrowBack className="text-lg" />
        <span className="font-medium">운전자 목록으로 돌아가기</span>
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 좌측 프로필 패널 */}
        <div className="lg:col-span-1">
          {/* 프로필 카드 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-6">
            <div className="text-center">
              <IoPersonCircle className="text-blue-500 text-8xl mx-auto mb-4 drop-shadow" />
              <div className="text-xl font-bold text-gray-900 mb-2">{username || "이름 없음"}</div>
              <div className="text-gray-500 text-sm mb-3">{phoneNumber || "전화번호 없음"}</div>
              <div className="space-y-2 text-xs">
                {licenseNumber && (
                  <div className="bg-gray-50 text-gray-700 px-3 py-2 rounded">
                    면허번호: {licenseNumber}
                  </div>
                )}
                {careerYears && (
                  <div className="bg-gray-50 text-gray-700 px-3 py-2 rounded">
                    경력: {careerYears}년
                  </div>
                )}
                {avgDrivingScore && (
                  <div className="bg-gray-50 text-gray-700 px-3 py-2 rounded">
                    평균점수: {avgDrivingScore}점
                  </div>
                )}
                {grade && (
                  <div className="bg-gray-50 text-gray-700 px-3 py-2 rounded">
                    등급: {grade}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 경고 통계 카드 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">경고 통계</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">총 경고</span>
                <span className="font-bold text-red-600">{warningStats.total}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">이번 달</span>
                <span className="font-bold text-orange-600">{warningStats.thisMonth}건</span>
              </div>
              <div className="border-t pt-3">
                <div className="text-sm text-gray-600 mb-2">타입별 통계</div>
                {Object.entries(warningStats.byType || {}).map(([type, count], index) => (
                  <div key={`warning-type-${type}-${index}`} className="flex justify-between text-sm">
                    <span className="text-gray-500">{getWarningTypeLabel(type)}</span>
                    <span className="text-gray-700">{count}건</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 우측 메인 패널 */}
        <div className="lg:col-span-3">
          {/* 배차 내역 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">배차 내역</h3>
            
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
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-gray-600">배차ID</th>
                    <th className="py-2 px-4 text-gray-600">날짜</th>
                    <th className="py-2 px-4 text-gray-600">버스</th>
                    <th className="py-2 px-4 text-gray-600">상태</th>
                    <th className="py-2 px-4 text-gray-600">점수</th>
                  </tr>
                </thead>
                <tbody>
                  {(dispatchHistory || []).map((dispatch, index) => (
                    <tr key={`dispatch-${dispatch?.dispatchId || index}`} className="hover:bg-blue-50 transition rounded">
                      <td className="py-2 px-4 rounded-l">{dispatch.dispatchId}</td>
                      <td className="py-2 px-4">{dispatch.dispatchDate}</td>
                      <td className="py-2 px-4">{dispatch.busId}번</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          dispatch.status === "COMPLETED" ? "bg-green-50 text-green-700" :
                          dispatch.status === "SCHEDULED" ? "bg-blue-50 text-blue-700" :
                          dispatch.status === "DELAYED" ? "bg-orange-50 text-orange-700" :
                          "bg-gray-50 text-gray-500"
                        }`}>
                          {dispatch.status === "COMPLETED" ? "완료" :
                           dispatch.status === "SCHEDULED" ? "예정" :
                           dispatch.status === "DELAYED" ? "지연" : "대기"}
                        </span>
                      </td>
                      <td className="py-2 px-4 rounded-r">{dispatch.drivingScore || "-"}점</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 경고 이력 */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">경고 이력</h3>
            
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
              <div className="space-y-3">
                {(warningHistory || []).map((warning, index) => (
                  <div key={`warning-${warning?.warningId || index}`} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            warning.warningType === 'SPEED_VIOLATION' ? 'bg-red-50 text-red-700' :
                            warning.warningType === 'HARSH_BRAKING' ? 'bg-orange-50 text-orange-700' :
                            warning.warningType === 'HARSH_ACCELERATION' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-gray-50 text-gray-700'
                          }`}>
                            {getWarningTypeLabel(warning.warningType)}
                          </span>
                          <span className="text-xs text-gray-500">
                            경고 ID: {warning.warningId}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{warning.description}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {new Date(warning.warningTime).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoPersonCircle } from "react-icons/io5";
import axios from "axios";
import { useToast } from "../components/Toast/ToastProvider";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

const UserDetailPage = () => {
  const { id } = useParams(); // URL에서 사용자 ID 가져오기
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [status, setStatus] = useState("");
  const [routes, setRoutes] = useState("");
  const [dispatchHistory, setDispatchHistory] = useState([]);

    // 사용자 데이터 불러오기
  const fetchUserData = async (userId) => {
    setLoading(true);
    try {
      // 운전자 정보 가져오기
      const response = await axios.get(`/api/drivers/${userId}`);
      const driver = response.data;
      
      setName(driver.name || "");
      setEmail(driver.email || "");
      setJoinDate(driver.joinDate ? driver.joinDate.split('T')[0] : "");
      setStatus(driver.status || "");
      setRoutes(driver.routes || "");

      // 배차 이력 가져오기
      const dispatchResponse = await axios.get("/api/dispatch");
      const userDispatches = dispatchResponse.data.filter(d => d.driverId === parseInt(userId));
      setDispatchHistory(userDispatches);
      
    } catch (error) {
      console.error("사용자 정보 로딩 실패:", error);
      toast.error("사용자 정보를 불러올 수 없습니다.");
      setError("사용자 정보를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserData(id);
    } else {
      // ID가 없으면 새 사용자 생성 모드
      setLoading(false);
    }
  }, [id]); // fetchUserData를 의존성에서 제외하고 id만 포함

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const updateData = {
        driverName: name,
        status: status,
        // 다른 필요한 필드들...
      };
      
      if (id) {
        // 기존 사용자 수정
        await axios.put(`/api/drivers/${id}`, updateData);
        toast.success("사용자 정보가 수정되었습니다!");
      } else {
        // 새 사용자 생성 (실제로는 회원가입 페이지에서 해야 함)
        await axios.post("/api/drivers", updateData);
        toast.success("새 사용자가 생성되었습니다!");
      }
    } catch (error) {
      console.error("저장 실패:", error);
      toast.error("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 삭제 처리 함수
  const handleDelete = async () => {
    if (window.confirm('정말로 사용자를 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/drivers/${id}`);
        toast.success('사용자가 삭제되었습니다.');
        navigate("/drivers");
      } catch (error) {
        console.error("삭제 실패:", error);
        toast.error("삭제에 실패했습니다.");
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-400">로딩중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* 프로필 카드 */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm flex items-center gap-6 p-8 mb-4">
        <IoPersonCircle className="text-blue-500 text-7xl drop-shadow" />
        <div>
          <div className="text-2xl font-extrabold text-gray-900 mb-1">{name}</div>
          <div className="text-gray-500 text-sm mb-1">{email}</div>
          <div className="flex gap-2 text-xs">
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">가입일: {joinDate}</span>
            <span className={`px-2 py-1 rounded ${status === "활성" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>{status}</span>
          </div>
        </div>
      </div>
      {/* 정보 수정 폼 */}
      <form
        className="bg-white border border-gray-100 rounded-lg shadow-sm p-8 flex flex-col gap-5 mb-8"
        onSubmit={handleSubmit}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-2">기본 정보 수정</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-semibold mb-1">이름</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={10}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">이메일</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">가입일</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={joinDate}
              onChange={e => setJoinDate(e.target.value)}
              type="date"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">상태</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="활성">활성</option>
              <option value="비활성">비활성</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">최근 운행 노선</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={routes}
            onChange={e => setRoutes(e.target.value)}
            placeholder="예: 101번, 202번"
          />
        </div>
        {/* 삭제/저장 버튼 - 둘 다 작게 */}
        <div className="flex gap-2 justify-end mt-2 mb-4">
          {id && (
            <button
              className="w-28 py-1 text-sm bg-red-500 hover:bg-red-600 text-white font-semibold rounded transition"
              onClick={handleDelete}
              type="button"
            >
              사용자 삭제
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-28 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition disabled:bg-blue-300"
          >
            {saving ? "저장중..." : "저장"}
          </button>
        </div>
      </form>

      {/* 배차 내역 */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">배차 내역</h3>
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
              {dispatchHistory.map((dispatch) => (
                <tr key={dispatch.dispatchId} className="hover:bg-blue-50 transition rounded">
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
    </div>
  );
};

export default UserDetailPage;
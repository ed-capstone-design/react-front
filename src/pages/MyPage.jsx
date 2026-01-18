import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoMail, IoCall, IoPersonCircle } from "react-icons/io5";
import { useAuthContext } from "../Context/AuthProvider";
import { authManager } from "../components/Token/authManager";
import { useToast } from "../components/Toast/ToastProvider";
import PasswordChangeForm from "../components/Profile/PasswordChangeForm";
import axios from "axios";

const MyPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const toast = useToast();

  const [userInfo, setLocalUserInfo] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      // authManager에서 사용자 정보 추출
      const savedUserInfo = user;
      const token = authManager.getToken();

      console.log("🔍 MyPage 디버깅 정보:");
      console.log("- savedUserInfo:", savedUserInfo);
      console.log("- token 존재:", !!token);
      console.log("- token 앞 10자:", token ? token.substring(0, 10) + "..." : "없음");

      if (!token) {
        console.error("❌ 토큰이 없습니다. 로그인 페이지로 이동합니다.");
        navigate("/signin");
        return;
      }

      if (savedUserInfo && savedUserInfo.email) {
        try {
          setLoading(true);
          setError("");

          console.log("📡 API 요청 전송:");
          console.log("- URL: /api/users/me");
          console.log("- Headers:", { Authorization: `Bearer ${token.substring(0, 10)}...` });

          const res = await axios.get(`/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          console.log("✅ API 응답 성공:", res.data);

          const { username, email, phoneNumber } = res.data.data;
          setLocalUserInfo(prev => ({
            ...prev,
            username: username || "",
            email: email || "",
            phoneNumber: phoneNumber || "",
          }));
        } catch (err) {
          console.error("❌ API 요청 실패:", err);
          console.error("- 상태 코드:", err.response?.status);
          console.error("- 응답 메시지:", err.response?.data);

          // CORS 에러 또는 네트워크 에러 처리
          if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
            console.error("🚨 백엔드 서버 연결 실패 - CORS 에러 또는 서버 다운");
            setError("백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
            return;
          }

          if (err.response?.status === 401) {
            console.error("🚨 인증 실패 - 토큰이 유효하지 않습니다. 로그아웃 처리합니다.");
            await logout();
            navigate("/signin");
            return;
          }

          setError("사용자 정보를 불러오지 못했습니다.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (userInfo.newPassword && userInfo.newPassword !== userInfo.confirmPassword) {
        setError("새 비밀번호가 일치하지 않습니다.");
        setLoading(false);
        return;
      }
      if (!(userInfo.currentPassword && userInfo.newPassword)) {
        setError("비밀번호 변경 항목을 모두 입력하세요.");
        setLoading(false);
        return;
      }
      const updateData = {
        currentPassword: userInfo.currentPassword,
        newPassword: userInfo.newPassword
      };
      const token = authManager.getToken();
      const res = await axios.patch("/api/users/me/password", updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 서버에서 최신 사용자 정보를 반환하면 userInfo 상태를 갱신
      if (res.data?.data) {
        const { username, email, phoneNumber } = res.data.data;
        setLocalUserInfo(prev => ({
          ...prev,
          username: username || prev.username,
          email: email || prev.email,
          phoneNumber: phoneNumber || prev.phoneNumber,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      } else {
        setLocalUserInfo(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      }
      toast.success("비밀번호가 성공적으로 변경되었습니다!");
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "프로필 업데이트에 실패했습니다.");
      } else {
        setError("서버 연결에 실패했습니다.");
      }
      toast.error("프로필 업데이트에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "정말로 회원탈퇴를 하시겠습니까?\n\n" +
      "⚠️ 탈퇴 시 모든 정보가 삭제되며, 이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;
    setLoading(true);
    setError("");
    try {
      const token = authManager.getToken();
      await axios.delete("/api/users/me", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      alert("회원 탈퇴가 완료되었습니다.");
      await logout();
      navigate("/signin");
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "회원 탈퇴에 실패했습니다.");
      } else {
        setError("서버 연결에 실패했습니다.");
      }
      toast.error("회원 탈퇴에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 상단 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-all duration-200"
        >
          <IoArrowBack className="text-lg" />
          돌아가기
        </button>
        <div className="h-4 w-px bg-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900 text-left">마이페이지</h2>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* 좌측: 프로필 정보 (기본 정보 통합) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">
                  {userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {userInfo.username || '사용자'}
              </h2>
              <p className="text-sm text-gray-500">관리자</p>
            </div>

            {/* 기본 정보를 프로필 카드에 통합 */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <IoMail className="text-sm text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">이메일</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userInfo.email || 'user@email.com'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <IoCall className="text-sm text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">전화번호</p>
                  <p className="text-sm font-medium text-gray-900">
                    {userInfo.phoneNumber || '010-0000-0000'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <IoPersonCircle className="text-sm text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">사용자명</p>
                  <p className="text-sm font-medium text-gray-900">
                    {userInfo.username || '사용자'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 비밀번호 변경 */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">비밀번호 변경</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <PasswordChangeForm userInfo={userInfo} onChange={handleInputChange} />

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? '처리 중...' : '계정 탈퇴'}
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? '저장 중...' : '비밀번호 변경'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;

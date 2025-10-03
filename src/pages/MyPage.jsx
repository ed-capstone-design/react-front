import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToken } from "../components/Token/TokenProvider";
import { useToast } from "../components/Toast/ToastProvider";
import ProfileHeader from "../components/Profile/ProfileHeader";
import BasicInfoForm from "../components/Profile/BasicInfoForm";
import PasswordChangeForm from "../components/Profile/PasswordChangeForm";
import ProfileActions from "../components/Profile/ProfileActions";
import axios from "axios";

const MyPage = () => {
  const navigate = useNavigate();
  const { getUserInfo, getUserInfoFromToken, logout, getToken } = useToken();
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
      // 새로운 사용자 정보 우선, 없으면 토큰에서 추출
      const savedUserInfo = getUserInfo() || getUserInfoFromToken();
      const token = getToken();
      
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
            logout();
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
      const token = getToken();
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
      const token = getToken();
      await axios.delete("/api/users/me", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      alert("회원 탈퇴가 완료되었습니다.");
      logout(); // 토큰과 사용자 정보 모두 제거
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <ProfileHeader 
          onBack={() => navigate(-1)} 
          userInfo={userInfo}
        />

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <BasicInfoForm userInfo={userInfo} onChange={handleInputChange} />
            <PasswordChangeForm userInfo={userInfo} onChange={handleInputChange} />
            {error && (
              <div className="text-red-500 text-sm p-4 bg-red-50 border border-red-200 rounded-lg">{error}</div>
            )}
            <ProfileActions loading={loading} onSave={handleUpdateProfile} onDelete={handleDeleteAccount} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyPage;

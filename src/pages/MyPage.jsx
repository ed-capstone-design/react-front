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
  const { getUserInfoFromToken, removeToken, getToken } = useToken();
  const toast = useToast();
  
  const [userInfo, setLocalUserInfo] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 초기 사용자 정보 로드
  useEffect(() => {
    const savedUserInfo = getUserInfoFromToken();
    if (savedUserInfo) {
      setLocalUserInfo(prev => ({
        ...prev,
        name: savedUserInfo.name || "",
        email: savedUserInfo.email || ""
      }));
    }
  }, [getUserInfoFromToken]);

  // 입력 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  // 프로필 업데이트 핸들러
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 비밀번호 변경 검증
      if (userInfo.newPassword && userInfo.newPassword !== userInfo.confirmPassword) {
        setError("새 비밀번호가 일치하지 않습니다.");
        setLoading(false);
        return;
      }

      const updateData = {
        name: userInfo.name,
        email: userInfo.email,
      };

      // 비밀번호 변경이 있는 경우에만 포함
      if (userInfo.currentPassword && userInfo.newPassword) {
        updateData.currentPassword = userInfo.currentPassword;
        updateData.newPassword = userInfo.newPassword;
      }

      await axios.put("/api/user/profile", updateData);
      
      toast.success("프로필이 성공적으로 업데이트되었습니다!");
      
      // 비밀번호 필드 초기화
      setLocalUserInfo(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));

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

  // 회원 탈퇴 핸들러
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "정말로 회원탈퇴를 하시겠습니까?\n\n" +
      "⚠️ 탈퇴 시 다음 정보가 모두 삭제됩니다:\n" +
      "• 운전 기록 및 평가 점수\n" +
      "• 스케줄 및 배차 정보\n" +
      "• 등록된 개인정보\n\n" +
      "이 작업은 되돌릴 수 없습니다."
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const token = getToken();
      await axios.delete("/api/user/account", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      alert("회원 탈퇴가 완료되었습니다.");
      removeToken();
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

        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <BasicInfoForm 
              userInfo={userInfo}
              onChange={handleInputChange}
            />

            <PasswordChangeForm 
              userInfo={userInfo}
              onChange={handleInputChange}
            />

            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-500 text-sm p-4 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <ProfileActions 
              loading={loading}
              onSave={handleUpdateProfile}
              onDelete={handleDeleteAccount}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyPage;

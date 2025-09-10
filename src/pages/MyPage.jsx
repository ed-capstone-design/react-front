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
      await axios.put("/api/user/profile", updateData);
      toast.success("비밀번호가 성공적으로 변경되었습니다!");
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

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <BasicInfoForm userInfo={userInfo} />
            <PasswordChangeForm userInfo={userInfo} />
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

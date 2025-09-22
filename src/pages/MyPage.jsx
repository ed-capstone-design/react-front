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
      if (savedUserInfo && savedUserInfo.email) {
        try {
          setLoading(true);
          setError("");
          const res = await axios.get(`/api/user/me`, {
            headers: { Authorization: `Bearer ${getToken()}` }
          });
          const { username, email, phoneNumber } = res.data;
          setLocalUserInfo(prev => ({
            ...prev,
            username: username || "",
            email: email || "",
            phoneNumber: phoneNumber || "",
          }));
        } catch (err) {
          setError("사용자 정보를 불러오지 못했습니다.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserInfo();
  }, []);

  // [예시] 토큰이 없거나 만료된 경우 로그인 페이지로 이동 (아직 반영하지 않음)
  /*
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/signin");
    }
    // 만약 토큰 만료 체크가 필요하다면, 만료 여부 확인 후 navigate("/signin")
  }, [getToken, navigate]);
  */


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
      const res = await axios.put("/api/users/me", updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 서버에서 최신 사용자 정보를 반환하면 userInfo 상태를 갱신
      if (res.data) {
        const { username, email, phoneNumber } = res.data;
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
      logout(); // 토큰과 사용자 정보 모두 삭제
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

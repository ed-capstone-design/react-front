// NOTE: 이 파일은 이전 회원가입 화면입니다. 현재 라우팅에서는 /signin, /signup 모두 Auth.jsx가 담당합니다.
// 필요 시 Auth.jsx로 통합된 폼을 사용하세요. 혼선을 피하기 위해 유지하되, 실제 라우트에서는 사용하지 않습니다.
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToken } from "../components/Token/TokenProvider";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

const Signup = () => {
  const [role, setRole] = useState("ADMIN"); // admin 또는 driver
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [operatorCode, setOperatorCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  // 운전자 추가 필드
  const [licenseNumber, setLicenseNumber] = useState("");
  const [career, setCareer] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { getToken } = useToken();

  // 이미 로그인된 사용자라면 홈으로 리다이렉트
  useEffect(() => {
    const token = getToken();
    if (token) {
      navigate("/home");
    }
  }, [navigate, getToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 필수값 체크
    if (!username || !email || !phoneNumber || !operatorCode || !password || !confirmpassword || (role === "driver" && (!licenseNumber || !career))) {
      setError("모든 항목을 입력해주세요.");
      setSuccess("");
      return;
    }
    if (password !== confirmpassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setSuccess("");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
        await axios.post("/api/auth/signup", {
          username: username,
          email: email,
          phoneNumber: phoneNumber,
          operatorCode: operatorCode,
          password: password,
          role: role,
          licenseNumber: role === "DRIVER" ? licenseNumber : undefined,
          career: role === "DRIVER" ? Number(career) : undefined,
        });
      
      setSuccess("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data.message || "회원가입에 실패했습니다.";
        setError(errorMessage);
      } else {
        setError("서버 연결에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white border border-gray-100 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 tracking-tight">회원가입</h2>
        {/* 관리자/드라이버 선택 */}
        <div className="mb-6 flex gap-6 justify-center">
          <label className="flex items-center gap-2 text-base font-medium text-gray-700">
            <input type="radio" value="admin" checked={role === "ADMIN"} onChange={() => setRole("ADMIN")} />
            <span>관리자</span>
          </label>
          <label className="flex items-center gap-2 text-base font-medium text-gray-700">
            <input type="radio" value="driver" checked={role === "DRIVER"} onChange={() => setRole("DRIVER")} />
            <span>운전자</span>
          </label>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">이름</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">이메일</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">휴대폰 번호</label>
              <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">회사코드</label>
              <input type="text" value={operatorCode} onChange={(e) => setOperatorCode(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
            </div>
            <div className="md:col-span-2 border-t pt-4" />
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">비밀번호</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">비밀번호 확인</label>
              <input type="password" value={confirmpassword} onChange={(e) => setConfirmpassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
            </div>
            {/* 운전자 선택 시 추가 입력 */}
            {role === "DRIVER" && (
              <>
                <div className="md:col-span-2 border-t pt-4" />
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">면허번호</label>
                  <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required={role === "driver"} />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">경력(년)</label>
                  <input type="number" min="0" value={career} onChange={(e) => setCareer(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required={role === "driver"} />
                </div>
              </>
            )}
          </div>
          {error && <div className="text-red-500 mt-6 mb-2 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 mt-6 mb-2 text-sm text-center">{success}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-lg transition">
            {loading ? "회원가입 중..." : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
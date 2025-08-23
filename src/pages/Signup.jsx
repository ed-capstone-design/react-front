import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

const Signup = () => {
  const [role, setRole] = useState("admin"); // admin 또는 driver
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 이미 로그인된 사용자라면 대시보드로 리다이렉트
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 필수값 체크
    if (!name || !email || !userid || !password || !confirm || !operatorId) {
      setError("모든 항목을 입력해주세요.");
      setSuccess("");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      setSuccess("");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (role === "admin") {
        await axios.post("/api/auth/register-admin", {
          adminId: userid,
          password: password,
          adminEmail: email,
          adminName: name,
          operatorId: operatorId
        });
      } else {
        await axios.post("/api/auth/register", {
          driverId: userid,
          password: password,
          email: email,
          driverName: name,
          operatorId: operatorId
        });
      }
      setSuccess("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "회원가입에 실패했습니다.");
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
        <div className="mb-8 flex gap-8 justify-center">
          <label className="flex items-center gap-2 text-lg font-semibold">
            <input type="radio" value="admin" checked={role === "admin"} onChange={() => setRole("admin")} />
            <span>관리자</span>
          </label>
          <label className="flex items-center gap-2 text-lg font-semibold">
            <input type="radio" value="driver" checked={role === "driver"} onChange={() => setRole("driver")} />
            <span>운전자</span>
          </label>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">이름</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">이메일</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">아이디</label>
              <input type="text" value={userid} onChange={(e) => setUserid(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">비밀번호</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">비밀번호 확인</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">운영사 ID</label>
              <input type="number" value={operatorId} onChange={(e) => setOperatorId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
            </div>
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
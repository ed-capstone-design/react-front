import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../components/Toast/ToastProvider";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

const Signin = () => {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // 이미 로그인된 사용자라면 대시보드로 리다이렉트
  useEffect(() => {
    // 개발용 더미 토큰 설정 (테스트용)
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', 'dummy_jwt_token');
      localStorage.setItem('adminId', '1');
      localStorage.setItem('adminName', '테스트관리자');
      localStorage.setItem('operatorId', '1');
      axios.defaults.headers.common['Authorization'] = 'Bearer dummy_jwt_token';
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userid || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      const response = await axios.post("/api/auth/login", {
        adminName: userid,
        adminPassword: password
      });
      
      // Admin 정보 저장
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('adminId', response.data.adminId);
      localStorage.setItem('adminName', response.data.adminName);
      localStorage.setItem('operatorId', response.data.operatorId);
      
      // axios 헤더에 토큰 설정
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      alert("로그인 성공!");
      toast.success("로그인되었습니다!");
      navigate("/dashboard");
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "로그인에 실패했습니다.");
      } else {
        setError("서버 연결에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white border border-gray-100 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-900 tracking-tight">로그인</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-semibold text-gray-700">아이디</label>
            <input
              type="text"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              autoFocus
            />
          </div>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-semibold text-gray-700">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>
          {error && (
            <div className="text-red-500 mb-4 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-600">아직 회원이 아니신가요? </span>
          <Link to="/signup" className="text-blue-600 hover:underline font-semibold">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signin;
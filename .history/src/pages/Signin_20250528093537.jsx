import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signin = () => {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userid || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    setError("");
    alert("로그인 성공!");
    navigate("/home");
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
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            로그인
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
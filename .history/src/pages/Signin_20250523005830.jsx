import React, { useState } from "react";
import { Link } from "react-router-dom"; // 추가

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setError("");
    alert("로그인 성공!");
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border border-gray-200 rounded-lg bg-white shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            아이디
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>
        </div>
        {error && (
          <div className="text-red-500 mb-4 text-sm">{error}</div>
        )}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
        >
          로그인
        </button>
      </form>
      <div className="mt-4 text-center">
        <span className="text-gray-600">아직 회원이 아니신가요? </span>
        <Link to="/signup" className="text-blue-600 hover:underline">
          회원가입
        </Link>
      </div>
    </div>
  );
};

export default Signin;
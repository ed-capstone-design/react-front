import React, { useState } from "react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || !confirm) {
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
    setSuccess("회원가입이 완료되었습니다!");
    // 실제 회원가입 로직 추가 가능
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border border-gray-200 rounded-lg bg-white shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            이메일
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
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            비밀번호 확인
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>
        </div>
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        {success && <div className="text-green-600 mb-4 text-sm">{success}</div>}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
        >
          회원가입
        </button>
      </form>
    </div>
  );
};

export default Signup;
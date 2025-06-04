import React, { useState } from "react";

const Signup = () => {
  const [userid, setUserid] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userid || !email || !password || !confirm) {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white border border-gray-100 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-900 tracking-tight">회원가입</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-semibold text-gray-700">아이디</label>
            <input
              type="text"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-semibold text-gray-700">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
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
          <div className="mb-5">
            <label className="block mb-2 text-sm font-semibold text-gray-700">비밀번호 확인</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>
          {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
          {success && <div className="text-green-600 mb-4 text-sm">{success}</div>}
          <button
            type="submit"
            className=
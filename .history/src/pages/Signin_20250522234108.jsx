import React, { useState } from "react";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // 여기에 실제 로그인 로직 추가
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setError("");
    // 예시: 로그인 성공 시 처리
    alert("로그인 성공!");
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, border: "1px solid #ddd", borderRadius: 8 }}>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>
            이메일
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
              required
            />
          </label>
        </div>
        {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
        <button type="submit" style={{ width: "100%", padding: 10, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4 }}>
          로그인
        </button>
      </form>
    </div>
  );
};

export default Signin;
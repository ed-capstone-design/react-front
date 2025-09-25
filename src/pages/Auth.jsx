import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../components/Toast/ToastProvider";
import { useToken } from "../components/Token/TokenProvider";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // 로그인 상태
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  // 회원가입 상태
  const [signupData, setSignupData] = useState({
    role: "ADMIN",
    username: "",
    email: "",
    phoneNumber: "",
    operatorCode: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    career: ""
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();
  const { getToken, login, getUserInfo } = useToken();

  // 이미 로그인된 사용자라면 대시보드로 리다이렉트
  useEffect(() => {
    const token = getToken();
    const userInfo = getUserInfo();
    if (token && userInfo) {
      navigate("/dashboard");
    }
  }, [navigate, getToken, getUserInfo]);

  // 패널 전환 함수
  const togglePanel = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setSuccess("");
  };

  // 로그인 핸들러
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      console.log("🔐 로그인 요청 전송:", { email: loginData.email });
      const response = await axios.post("/api/auth/login", {
        email: loginData.email,
        password: loginData.password
      });
      
      console.log("🔐 백엔드 응답:", response.data);
      
      let responseData;
      if (response.data.success && response.data.data) {
        responseData = response.data.data;
      } else if (response.data.token) {
        responseData = response.data;
      } else {
        throw new Error("예상하지 못한 응답 형태입니다.");
      }
      
      if (!responseData.token || !responseData.userId || !responseData.email || !responseData.username) {
        console.error("❌ 필수 필드 누락:", responseData);
        throw new Error("로그인 응답에 필수 정보가 누락되었습니다.");
      }
      
      const userInfo = login(responseData);
      toast.success(`${userInfo.username}님, 로그인되었습니다!`);
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

  // 회원가입 핸들러
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (signupData.password !== signupData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        role: signupData.role,
        username: signupData.username,
        email: signupData.email,
        phoneNumber: signupData.phoneNumber,
        operatorCode: signupData.operatorCode,
        password: signupData.password,
        ...(signupData.role === "DRIVER" && {
          licenseNumber: signupData.licenseNumber,
          career: parseInt(signupData.career)
        })
      };

      console.log("📝 회원가입 요청 전송:", payload);

      const response = await axios.post("/api/auth/register", payload);

      console.log("📝 백엔드 응답:", response.data);

      if (response.data.success) {
        setSuccess("회원가입이 완료되었습니다! 로그인해주세요.");
        setSignupData({
          role: "ADMIN",
          username: "",
          email: "",
          phoneNumber: "",
          operatorCode: "",
          password: "",
          confirmPassword: "",
          licenseNumber: "",
          career: ""
        });
        setTimeout(() => {
          setIsSignUp(false);
          setSuccess("");
        }, 2000);
      }
    } catch (error) {
      console.error("❌ 회원가입 에러:", error);
      if (error.response) {
        const errorMessage = error.response.data?.message || "회원가입에 실패했습니다.";
        setError(errorMessage);
      } else {
        setError("서버 연결에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl min-h-[650px] max-h-[85vh] overflow-hidden">
        
        {/* 회원가입 폼 */}
        <div className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-500 ease-in-out overflow-y-auto bg-white ${
          isSignUp ? 'translate-x-full opacity-100 z-10' : 'opacity-0 z-0'
        }`}>
          <form onSubmit={handleSignUp} className="flex flex-col items-center justify-start p-8 h-full">
            <div className="mb-8">
              <div className="flex flex-col items-center gap-2 mb-6">
                <img src="/logo.svg" alt="버스 관리 시스템" className="w-24 h-24 object-contain" />
              </div>
            </div>
            
            <h1 className="font-bold text-gray-800 text-3xl mb-6 tracking-tight">회원가입</h1>
            
            {/* 역할 선택 */}
            <div className="flex justify-center gap-6 mb-5 w-full">
              <label className="flex items-center gap-2 cursor-pointer text-sky-500 font-semibold text-sm transition-all duration-200 p-2 px-3 rounded-lg border-2 border-transparent hover:bg-blue-50 hover:border-sky-500">
                <input 
                  type="radio" 
                  value="ADMIN" 
                  checked={signupData.role === "ADMIN"} 
                  onChange={(e) => setSignupData({...signupData, role: e.target.value})} 
                  className="accent-sky-500"
                />
                관리자
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sky-500 font-semibold text-sm transition-all duration-200 p-2 px-3 rounded-lg border-2 border-transparent hover:bg-blue-50 hover:border-sky-500">
                <input 
                  type="radio" 
                  value="DRIVER" 
                  checked={signupData.role === "DRIVER"} 
                  onChange={(e) => setSignupData({...signupData, role: e.target.value})} 
                  className="accent-sky-500"
                />
                기사
              </label>
            </div>
            
            <input 
              type="text" 
              placeholder="이름" 
              value={signupData.username}
              onChange={(e) => setSignupData({...signupData, username: e.target.value})}
              required 
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 my-1.5 text-sm text-gray-800 font-medium transition-all duration-200 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-500/10"
            />
            <input 
              type="email" 
              placeholder="이메일" 
              value={signupData.email}
              onChange={(e) => setSignupData({...signupData, email: e.target.value})}
              required 
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 my-1.5 text-sm text-gray-800 font-medium transition-all duration-200 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-500/10"
            />
            <input 
              type="text" 
              placeholder="휴대폰 번호" 
              value={signupData.phoneNumber}
              onChange={(e) => setSignupData({...signupData, phoneNumber: e.target.value})}
              required 
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 my-1.5 text-sm text-gray-800 font-medium transition-all duration-200 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-500/10"
            />
            <input 
              type="text" 
              placeholder="회사코드" 
              value={signupData.operatorCode}
              onChange={(e) => setSignupData({...signupData, operatorCode: e.target.value})}
              required 
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 my-1.5 text-sm text-gray-800 font-medium transition-all duration-200 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-500/10"
            />
            <input 
              type="password" 
              placeholder="비밀번호" 
              value={signupData.password}
              onChange={(e) => setSignupData({...signupData, password: e.target.value})}
              required 
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 my-1.5 text-sm text-gray-800 font-medium transition-all duration-200 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-500/10"
            />
            <input 
              type="password" 
              placeholder="비밀번호 확인" 
              value={signupData.confirmPassword}
              onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
              required 
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 my-1.5 text-sm text-gray-800 font-medium transition-all duration-200 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-500/10"
            />
            
            {signupData.role === "DRIVER" && (
              <>
                <input 
                  type="text" 
                  placeholder="면허번호" 
                  value={signupData.licenseNumber}
                  onChange={(e) => setSignupData({...signupData, licenseNumber: e.target.value})}
                  required 
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 my-1.5 text-sm text-gray-800 font-medium transition-all duration-200 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-500/10"
                />
                <input 
                  type="number" 
                  placeholder="경력(년)" 
                  min="0"
                  value={signupData.career}
                  onChange={(e) => setSignupData({...signupData, career: e.target.value})}
                  required 
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 my-1.5 text-sm text-gray-800 font-medium transition-all duration-200 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-500/10"
                />
              </>
            )}
            
            {error && <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl my-4 text-sm text-center font-medium">{error}</div>}
            {success && <div className="bg-green-50 border-2 border-green-200 text-green-600 px-4 py-3 rounded-xl my-4 text-sm text-center font-medium">{success}</div>}
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-white border-2 border-sky-500 text-sky-600 hover:bg-sky-500 hover:text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              {loading ? "처리 중..." : "회원가입"}
            </button>
            
            <div className="mt-5 text-center md:hidden">
              <p className="text-gray-500 text-sm">
                이미 계정이 있으신가요? 
                <button 
                  type="button" 
                  className="text-sky-500 underline font-semibold text-sm ml-1 hover:text-sky-600 transition-colors duration-200" 
                  onClick={togglePanel}
                >
                  로그인
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* 로그인 폼 */}
        <div className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-500 ease-in-out bg-white z-20 ${
          isSignUp ? 'translate-x-full' : 'translate-x-0'
        }`}>
          <form onSubmit={handleSignIn} className="flex flex-col items-center justify-center p-8 h-full">
            <div className="mb-8">
              <div className="flex flex-col items-center gap-2 mb-6">
                <img src="/logo.svg" alt="버스 관리 시스템" className="w-24 h-24 object-contain" />
              </div>
            </div>
            
            <h1 className="font-bold text-gray-800 text-3xl mb-8 tracking-tight">로그인</h1>
            
            <input 
              type="email" 
              placeholder="이메일" 
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              required 
              autoFocus
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 my-2 text-sm text-gray-800 font-medium transition-all duration-200 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-500/10"
            />
            <input 
              type="password" 
              placeholder="비밀번호" 
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              required 
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 my-2 text-sm text-gray-800 font-medium transition-all duration-200 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-500/10"
            />
            
            {error && <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl my-4 text-sm text-center font-medium w-full">{error}</div>}
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
            
            <div className="mt-6 text-center md:hidden">
              <p className="text-gray-500 text-sm">
                계정이 없으신가요? 
                <button 
                  type="button" 
                  className="text-sky-500 underline font-semibold text-sm ml-1 hover:text-sky-600 transition-colors duration-200" 
                  onClick={togglePanel}
                >
                  회원가입
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* 오버레이 패널 */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-500 ease-in-out z-50 hidden md:block ${
          isSignUp ? '-translate-x-full' : 'translate-x-0'
        }`}>
          <div className={`relative left-[-100%] h-full w-[200%] bg-gradient-to-br from-blue-50 to-sky-100 text-blue-800 transition-transform duration-500 ease-in-out ${
            isSignUp ? 'translate-x-1/2' : 'translate-x-0'
          }`}>
            
            {/* 왼쪽 패널 (회원가입으로 이동) */}
            <div className={`absolute top-0 flex items-center justify-center flex-col px-10 text-center h-full w-1/2 transition-transform duration-500 ease-in-out ${
              isSignUp ? '-translate-x-1/5' : 'translate-x-0'
            }`}>
              <h1 className="font-bold text-2xl mb-4">다시 오신 것을 환영합니다!</h1>
              <p className="text-sm leading-relaxed mb-6 opacity-90">
                저희와 계속 연결되어 있으려면 개인 정보로 로그인하세요
              </p>
              <button 
                className="bg-transparent border-2 border-blue-800 text-blue-800 font-semibold px-8 py-3 rounded-xl transition-all duration-200 hover:bg-blue-800 hover:text-white hover:-translate-y-0.5"
                onClick={togglePanel}
              >
                로그인
              </button>
            </div>
            
            {/* 오른쪽 패널 (로그인으로 이동) */}
            <div className={`absolute top-0 right-0 flex items-center justify-center flex-col px-10 text-center h-full w-1/2 transition-transform duration-500 ease-in-out ${
              isSignUp ? 'translate-x-1/5' : 'translate-x-0'
            }`}>
              <h1 className="font-bold text-2xl mb-4">안녕하세요, 친구!</h1>
              <p className="text-sm leading-relaxed mb-6 opacity-90">
                계정을 생성하고 우리와 함께 여행을 시작해보세요
              </p>
              <button 
                className="bg-transparent border-2 border-blue-800 text-blue-800 font-semibold px-8 py-3 rounded-xl transition-all duration-200 hover:bg-blue-800 hover:text-white hover:-translate-y-0.5"
                onClick={togglePanel}
              >
                회원가입
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Auth;
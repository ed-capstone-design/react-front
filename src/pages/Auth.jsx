import { useAuthPage } from "../hooks/PageCustomHook/useAuthPage";
import LoginForm from "../components/AuthForm/LoginForm";
import SignupForm from "../components/AuthForm/SignupForm";


const Auth = () => {
  // 1. 모든 로직은 훅에서 가져옵니다. (코드가 깔끔해짐)
  const {
    isSignup,
    togglePanel,
    isLoading,
    loginForm,
    signupForm,
    handleLoginSubmit,
    handleSignupSubmit,
  } = useAuthPage();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl min-h-[600px] overflow-hidden">
        {/* 1. 회원가입 폼 (왼쪽/오른쪽 슬라이딩 영역) */}
        <div className={`absolute top-0 left-0 h-full w-full md:w-1/2 transition-all duration-500 ease-in-out ${isSignup
          ? 'opacity-100 z-20 translate-x-full' // PC: 오른쪽으로 이동
          : 'opacity-0 z-0'
          } ${isSignup ? 'block' : 'hidden md:block'} `} // 모바일: 보였다 안보였다 처리
        >
          <SignupForm
            form={signupForm}
            onSubmit={handleSignupSubmit}
            isLoading={isLoading}
            onSwitchPanel={togglePanel} // 모바일용 전환 버튼
          />
        </div>
        {/* 2. 로그인 폼 (왼쪽/오른쪽 슬라이딩 영역) */}
        <div className={`absolute top-0 left-0 h-full w-full md:w-1/2 transition-all duration-500 ease-in-out ${isSignup
          ? 'opacity-0 z-0'
          : 'opacity-100 z-20' // 기본 위치
          } ${!isSignup ? 'block' : 'hidden md:block'}`}
        >
          <LoginForm
            form={loginForm}
            onSubmit={handleLoginSubmit}
            isLoading={isLoading}
            onSwitchPanel={togglePanel} // 모바일용 전환 버튼
          />
        </div>
        {/* 3. 오버레이 패널 (PC 전용 장식 - 슬라이딩 애니메이션) */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-500 ease-in-out z-30 hidden md:block ${isSignup ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          <div className={`relative -left-full h-full w-[200%] bg-gradient-to-r from-blue-500 to-blue-600 text-white transform transition-transform duration-500 ease-in-out ${isSignup ? 'translate-x-1/2' : 'translate-x-0'
            }`}
          >
            {/* 오버레이: 왼쪽 (로그인하러 가기) */}
            <div className={`absolute top-0 flex flex-col items-center justify-center h-full w-1/2 px-8 text-center transition-transform duration-500 ease-in-out ${isSignup ? 'translate-x-0' : '-translate-x-[20%]'
              }`}
            >
              <h1 className="text-3xl font-bold mb-4">돌아오셨군요!</h1>
              <p className="mb-8">서비스를 이용하시려면 로그인을 해주세요.</p>
              <button
                onClick={togglePanel}
                className="border-2 border-white rounded-full px-10 py-2 font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                로그인하기
              </button>
            </div>
            {/* 오버레이: 오른쪽 (가입하러 가기) */}
            <div className={`absolute top-0 right-0 flex flex-col items-center justify-center h-full w-1/2 px-8 text-center transition-transform duration-500 ease-in-out ${isSignup ? 'translate-x-[20%]' : 'translate-x-0'
              }`}
            >
              <h1 className="text-3xl font-bold mb-4">안녕하세요!</h1>
              <p className="mb-8">처음 오셨나요? 회원가입을 하고 시작해보세요.</p>
              <button
                onClick={togglePanel}
                className="border-2 border-white rounded-full px-10 py-2 font-semibold hover:bg-white hover:text-blue-600 transition-colors"
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
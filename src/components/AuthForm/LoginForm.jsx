

const LoginForm = ({ form, onSubmit, isLoading }) => {
    // 부모에게 받은 form 객체에서 필요한 것만 꺼냄
    const { register, formState: { errors } } = form;

    return (
        <form onSubmit={onSubmit} className="flex flex-col items-center justify-center p-8 h-full">
            <div className="mb-8">
                <div className="flex flex-col items-center gap-2 mb-6">
                    <img src="/logo.svg" alt="버스 관리 시스템" className="w-24 h-24 object-contain" />
                </div>
            </div>

            <h1 className="font-bold text-gray-800 text-3xl mb-8 tracking-tight">로그인</h1>

            <input
                {...register("email", { required: "이메일을 입력해주세요" })}
                type="email"
                placeholder="이메일"
                autoFocus
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 my-2 text-sm text-gray-800 font-medium transition-all duration-200 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-500/10"
            />
            {errors.email && <span className="text-red-500 text-xs w-full text-left ml-2">{errors.email.message}</span>}

            <input
                {...register("password", { required: "비밀번호를 입력해주세요" })}
                type="password"
                placeholder="비밀번호"
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 my-2 text-sm text-gray-800 font-medium transition-all duration-200 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-500/10"
            />
            {errors.password && <span className="text-red-500 text-xs w-full text-left ml-2">{errors.password.message}</span>}

            {/* 서버 에러 메시지 */}
            {errors.root && (
                <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl my-4 text-sm text-center font-medium w-full">
                    {errors.root.message}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
                {isLoading ? "로그인 중..." : "로그인"}
            </button>

            {/* 모바일용 전환 버튼은 부모(Auth)에서 처리하거나 여기서 처리해도 됨 (여기선 생략하고 데스크탑 위주) */}
        </form>
    );
};

export default LoginForm;
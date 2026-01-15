
export const SignupForm = ({ form, onSubmit, isLoading, onSwitchPanel }) => {
    const { register, formState: { errors }, watch } = form;

    // 실시간 감시
    const role = watch("role");
    const password = watch("password");

    return (
        <form onSubmit={onSubmit} className="flex flex-col items-center justify-start p-8 h-full">
            {/* ... 로고 부분 생략 (LoginForm과 동일) ... */}
            <h1 className="font-bold text-gray-800 text-3xl mb-6 tracking-tight">회원가입</h1>

            {/* 역할 선택 */}
            <div className="flex justify-center gap-6 mb-5 w-full">
                <label className="flex items-center gap-2 cursor-pointer text-sky-500 font-semibold text-sm p-2 rounded-lg border-2 border-transparent hover:bg-blue-50">
                    <input {...register("role")} type="radio" value="ADMIN" defaultChecked className="accent-sky-500" /> 관리자
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sky-500 font-semibold text-sm p-2 rounded-lg border-2 border-transparent hover:bg-blue-50">
                    <input {...register("role")} type="radio" value="DRIVER" className="accent-sky-500" /> 기사
                </label>
            </div>

            {/* 기본 입력 필드들 (스타일 클래스는 간략화함, 복사해서 쓰세요) */}
            <input {...register("username", { required: "이름 필수" })} placeholder="이름" className="input-style..." />
            {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}

            <input {...register("email", { required: "이메일 필수" })} type="email" placeholder="이메일" className="input-style..." />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}

            <input {...register("phoneNumber", { required: "폰번호 필수" })} placeholder="휴대폰 번호" className="input-style..." />
            <input {...register("operatorCode", { required: "회사코드 필수" })} placeholder="회사코드" className="input-style..." />

            {/* 비밀번호 */}
            <input
                {...register("password", { required: "비밀번호 필수", minLength: { value: 6, message: "6자 이상" } })}
                type="password" placeholder="비밀번호" className="input-style..."
            />
            {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}

            {/* 비번 확인 */}
            <input
                {...register("confirmPassword", {
                    required: "확인 필수",
                    validate: v => v === password || "불일치"
                })}
                type="password" placeholder="비밀번호 확인" className="input-style..."
            />
            {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>}

            {/* 조건부 렌더링 */}
            {role === "DRIVER" && (
                <>
                    <input {...register("licenseNumber", { required: "면허번호 필수" })} placeholder="면허번호" className="input-style..." />
                    <input {...register("careerYears", { required: "경력 필수" })} type="number" placeholder="경력" className="input-style..." />
                </>
            )}

            {errors.root && <div className="text-red-500 my-2">{errors.root.message}</div>}

            <button type="submit" disabled={isLoading} className="btn-style...">
                {isLoading ? "가입 중..." : "회원가입"}
            </button>

            {/* 모바일용 전환 버튼 */}
            <div className="mt-5 text-center md:hidden">
                <button type="button" onClick={onSwitchPanel} className="text-sky-500 underline">로그인</button>
            </div>
        </form>
    );
};

export default SignupForm;
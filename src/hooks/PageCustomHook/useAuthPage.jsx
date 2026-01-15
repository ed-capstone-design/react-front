import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { useAuthCheck, useLogin, useSignup } from "../QueryLayer/useAuth";
import { useForm } from "react-hook-form";




export const useAuthPage = () => {

    const [isSignup, setisSignup] = useState(false);

    const navigate = useNavigate()
    const { isLoggedIn } = useAuthCheck();
    const { mutate: login, isPending: isLoginPending } = useLogin();
    const { mutate: signup, isPending: isSignupPending } = useSignup();

    const loginForm = useForm({ mode: "onSubmit" });
    const signupForm = useForm({ mode: "onSubmit" });

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/");
        }
    }, [isLoggedIn, navigate]);

    const togglePanel = () => {
        setisSignup((prev) => !prev);
        loginForm.clearErrors();
        signupForm.clearErrors();
    }
    const onLoginSubmit = (data) => {
        login(data, {
            onError: (error) => {
                loginForm.setError("root", { type: "server", message: error.response?.data?.message || "로그인 실패" });
            }
        });
    }
    const onSignupSubmit = (data) => {
        if (data.password !== data.confirmPassword) {
            signupForm.setError("confirmPassword", {
                message: "비밀번호 불일치"
            });
            return;
        }
        const payload = {
            ...data,
            careerYears: data.role === "DRIVER" ? parseInt(data.careerYears || 0) : 0
        };
        signup(payload, {
            onError: (error) => {
                signupForm.setError("root", {
                    message: error.response?.data?.message || "회원가입 실패"
                });
            }
        });
    };
    return {
        isSignup,
        togglePanel,
        isLoading: isLoginPending || isSignupPending,
        loginForm,
        signupForm,
        handleLoginSubmit: loginForm.handleSubmit(onLoginSubmit),
        handleSignupSubmit: signupForm.handleSubmit(onSignupSubmit),
    };

}
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/ServiceLayer/authService";
import { userService } from "../../api/ServiceLayer/userService";
import { authManager } from "../../components/Token/authManager";
import { useSyncExternalStore } from "react";
export const AUTH_KEYS = {
  all: ["auth"],
  user: () => [...AUTH_KEYS.all, "user"],
};

export const useSignup = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.signup,
    onSuccess: () => {
      alert("회원가입에 성공하였습니다. 로그인해주세요");
      navigate("/auth");
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "회원가입에 실패하였습니다.";
      alert(message);
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (userInfo) => {
      console.log("로그인 성공:", userInfo);
      navigate("/");
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "로그인에 실패하였습니다.";
      alert(message);
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: AUTH_KEYS.all });
      navigate("/auth");
    },
  });
};

export const useAuthCheck = () => {
  const token = useSyncExternalStore(
    (callback) => authManager.onChange(callback), // 구독 함수 (변경 시 리액트에게 알림)
    () => authManager.getToken() // 스냅샷 함수 (현재 값 가져오기)
  );
  const isTokenExists = !!token;
  return useQuery({
    queryKey: AUTH_KEYS.user(),
    queryFn: userService.getMe,
    enabled: isTokenExists,
    retry: false,
    staleTime: 1000 * 60 * 30,
  });
};

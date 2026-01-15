import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/ServiceLayer/authService";
import { userService } from "../../api/ServiceLayer/userService";
import { tokenStorage } from "../../components/Token/tokenStorage";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (userInfo) => {
      console.log("로그인 성공:", userInfo);
      queryClient.setQueryData(AUTH_KEYS.user(), userInfo);
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
  const isTokenExists = !!tokenStorage.get();

  return useQuery({
    queryKey: AUTH_KEYS.user(),
    queryFn: userService.getMe,
    enabled: isTokenExists,
    retry: false,
    staleTime: 1000 * 60 * 30,
  });
};

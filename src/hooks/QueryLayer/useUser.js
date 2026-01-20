import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../api/ServiceLayer/userService";
import { AUTH_KEYS } from "./useAuth"; // useAuth에 있는 키 재사용
import { authManager } from "../../components/Token/authManager";

export const useUser = () => {
  return useQuery({
    queryKey: AUTH_KEYS.user(),
    queryFn: userService.getMe,
    // 토큰이 있을 때만 실행되도록 useAuth에서 제어하거나, 여기서 enabled 처리
    staleTime: 1000 * 60 * 30, // 30분 캐시
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      // 내 정보 갱신
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user() });
    },
  });
};

export const useChangePassword = () => {
  // 비밀번호 변경은 캐시 갱신할 게 딱히 없음
  return useMutation({
    mutationFn: userService.updatePassword,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.withdraw,
    onSuccess: () => {
      authManager.logout(); // 로컬 스토리지 비우기
      queryClient.removeQueries(); // React Query 캐시 비우기
    },
  });
};

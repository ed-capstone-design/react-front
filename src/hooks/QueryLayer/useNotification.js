import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { notificationsService } from "../../api/ServiceLayer/notificationService";

const NOTIFICATION_KEY = {
  all: ["notification"],
  unread: () => [...NOTIFICATION_KEY.all, "unread"],
  list: () => [...NOTIFICATION_KEY.all, "list"],
  detail: (id) => [...NOTIFICATION_KEY.all, "detail", id],
};
export const useUnreadNotification = () => {
  return useQuery({
    queryKey: NOTIFICATION_KEY.unread(),
    queryFn: () => notificationsService.unread(),
    refetchOnWindowFocus: false,
  });
};

export const useReadNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationsService.read(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEY.all });
    },
    onError: (error) => {
      console.error(`읽음 처리 동기화 실패: ${error?.message}`);
    },
  });
};
export const useNotification = () => {
  return useQuery({
    queryKey: NOTIFICATION_KEY.list(),
    queryFn: () => notificationsService.allNotification(),
    staleTime: 1 * 1000 * 60,
  });
};

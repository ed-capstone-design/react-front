import {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useUnreadNotification } from "../hooks/QueryLayer/useNotification";
import { useToast } from "../components/Toast/ToastProvider";
import { useWebSocketNotification } from "../hooks/WebSocket/useDomainSocket";

const notificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { info } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: unreadList } = useUnreadNotification();

  useEffect(() => {
    if (Array.isArray(unreadList)) {
      setUnreadCount(unreadList.length);
    }
  }, [unreadList]);


  const handleSocketMessage = useCallback((message) => {
    const payload = message?.payload ?? message;
    info(payload?.message || "새로운 알림이 도착하였습니다");
    setUnreadCount((prev) => prev + 1);
  }, [info]);

  useWebSocketNotification(handleSocketMessage);
  const value = useMemo(
    () => ({
      unreadCount,
      decreaseUnreadCount: () => setUnreadCount(prev => Math.max(0, prev - 1)),
      resetUnreadCount: () => setUnreadCount(0), // 선택사항
    }),
    [unreadCount]
  );
  return (
    <notificationContext.Provider value={value}>
      {children}
    </notificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(notificationContext);
  if (!context)
    throw new Error("NotificationContext 범위 밖의 context 접근입니다.");
  return context;
};

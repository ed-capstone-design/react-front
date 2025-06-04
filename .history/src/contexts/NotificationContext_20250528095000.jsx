import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: "운전자 홍길동이 운행을 시작했습니다.", date: "2025-05-28", read: false, type: "info" },
    { id: 2, message: "차량 101번의 점검이 필요합니다.", date: "2025-05-28", read: false, type: "warning" },
    { id: 3, message: "신규 운전자가 가입했습니다.", date: "2025-05-27", read: true, type: "info" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(nots => nots.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const removeNotification = (id) => {
    setNotifications(nots => nots.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(nots => nots.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      removeNotification,
      markAllAsRead,
      setNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
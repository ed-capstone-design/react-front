import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: "운행 시작",
      message: "운전자 홍길동이 101번 노선 운행을 시작했습니다.", 
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
      read: false, 
      type: "info",
      priority: "normal",
      driverId: 1,
      action: "view_driver"
    },
    { 
      id: 2, 
      title: "차량 점검 필요",
      message: "차량 101번의 정기 점검 일정이 도래했습니다.", 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
      read: false, 
      type: "warning",
      priority: "high",
      busId: 101,
      action: "schedule_maintenance"
    },
    { 
      id: 3, 
      title: "긴급 상황",
      message: "운전자 김영희가 응급상황을 신고했습니다.", 
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5분 전
      read: false, 
      type: "error",
      priority: "urgent",
      driverId: 5,
      action: "emergency_response"
    },
    { 
      id: 4, 
      title: "운행 완료",
      message: "운전자 박민수가 202번 노선 운행을 완료했습니다.", 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4시간 전
      read: true, 
      type: "success",
      priority: "normal",
      driverId: 3,
      action: "view_report"
    },
    { 
      id: 5, 
      title: "신규 운전자 가입",
      message: "이철수가 신규 운전자로 가입했습니다.", 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1일 전
      read: true, 
      type: "info",
      priority: "low",
      driverId: 8,
      action: "view_driver"
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  // 우선순위별 카운트
  const priorityCounts = {
    urgent: notifications.filter(n => !n.read && n.priority === "urgent").length,
    high: notifications.filter(n => !n.read && n.priority === "high").length,
    normal: notifications.filter(n => !n.read && n.priority === "normal").length,
    low: notifications.filter(n => !n.read && n.priority === "low").length,
  };

  // 타입별 카운트
  const typeCounts = {
    error: notifications.filter(n => !n.read && n.type === "error").length,
    warning: notifications.filter(n => !n.read && n.type === "warning").length,
    info: notifications.filter(n => !n.read && n.type === "info").length,
    success: notifications.filter(n => !n.read && n.type === "success").length,
  };
  const markAsRead = (id) => {
    setNotifications(nots => nots.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const removeNotification = (id) => {
    setNotifications(nots => nots.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(nots => nots.map(n => ({ ...n, read: true })));
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      priority: "normal",
      ...notification
    };
    setNotifications(nots => [newNotification, ...nots]);
  };

  const getFilteredNotifications = (filter) => {
    let filtered = notifications;
    
    if (filter.unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }
    
    if (filter.type && filter.type !== "all") {
      filtered = filtered.filter(n => n.type === filter.type);
    }
    
    if (filter.priority && filter.priority !== "all") {
      filtered = filtered.filter(n => n.priority === filter.priority);
    }
    
    // 우선순위별 정렬 (urgent > high > normal > low)
    const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
    filtered = filtered.sort((a, b) => {
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    return filtered;
  };
  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      priorityCounts,
      typeCounts,
      markAsRead,
      removeNotification,
      markAllAsRead,
      addNotification,
      getFilteredNotifications,
      setNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
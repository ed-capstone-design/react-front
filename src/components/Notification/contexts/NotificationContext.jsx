import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useSchedule } from "../../Schedule/ScheduleContext";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchSchedulesByDate } = useSchedule();

  // 알림 목록 불러오기
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // 실제 notification API가 있다면 사용, 없다면 기존 데이터들로부터 알림 생성
      const response = await axios.get("/api/notifications");
      setNotifications(response.data);
    } catch (error) {
        console.log("알림 API를 사용할 수 없어 기존 데이터로부터 알림을 생성합니다.");
      // API가 없는 경우, 다른 데이터들로부터 알림 생성
      await generateNotificationsFromData();
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩 시 알림 목록 불러기
  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchNotifications를 의존성 배열에서 의도적으로 제외

  // 기존 데이터로부터 알림 생성 (백엔드 notification API가 없을 때 대안)
  const generateNotificationsFromData = async () => {
    try {
      const mockNotifications = [];
      
      // 1. Warning 데이터로부터 알림 생성
      try {
        const warningResponse = await axios.get("/api/warnings");
        const warnings = warningResponse.data;
        
        warnings.forEach(warning => {
          mockNotifications.push({
            id: `warning_${warning.warningId}`,
            title: getWarningTitle(warning.warningType),
            message: `${warning.warningType} 경고가 발생했습니다.`,
            timestamp: new Date(warning.warningTime),
            read: false,
            type: "warning",
            priority: "high",
            dispatchId: warning.dispatchId,
            action: "view_warning"
          });
        });
      } catch (e) {
        // Warning 데이터를 불러올 수 없는 경우 빈 처리
      }

      // 2. 오늘 스케줄 상태로부터 알림 생성 (최적화)
      try {
        const today = new Date().toISOString().split('T')[0];
        const todaySchedules = await fetchSchedulesByDate(today);
        
        todaySchedules.forEach(schedule => {
          if (schedule.status === "COMPLETED") {
            mockNotifications.push({
              id: `schedule_${schedule.scheduleId}`,
              title: "운행 완료",
              message: `스케줄 ${schedule.scheduleId}번의 운행이 완료되었습니다.`,
              timestamp: new Date(schedule.actualArrival || Date.now()),
              read: false,
              type: "success",
              priority: "normal",
              scheduleId: schedule.scheduleId,
              action: "view_schedule"
            });
          } else if (schedule.status === "DELAYED") {
            mockNotifications.push({
              id: `schedule_delay_${schedule.scheduleId}`,
              title: "운행 지연",
              message: `스케줄 ${schedule.scheduleId}번이 지연되었습니다.`,
              timestamp: new Date(),
              read: false,
              type: "warning",
              priority: "high",
              scheduleId: schedule.scheduleId,
              action: "view_schedule"
            });
          }
        });
      } catch (e) {
        console.log("오늘 스케줄 데이터를 불러올 수 없습니다.");
      }

      // 3. 기본 더미 알림 추가 (데이터가 없을 경우)
      if (mockNotifications.length === 0) {
        mockNotifications.push(
          {
            id: 1,
            title: "시스템 알림",
            message: "운전의 진수 시스템이 정상적으로 작동 중입니다.",
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
            read: false,
            type: "info",
            priority: "normal",
            action: "view_system"
          }
        );
      }

      // 시간 순으로 정렬 (최신 순)
      mockNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(mockNotifications);
      
    } catch (error) {
      console.error("알림 생성 중 오류:", error);
      // 완전한 fallback 데이터
      setNotifications([
        {
          id: 1,
          title: "시스템 시작",
          message: "운전의 진수 시스템이 시작되었습니다.",
          timestamp: new Date(),
          read: false,
          type: "info",
          priority: "normal",
          action: "view_system"
        }
      ]);
    }
  };

  // 경고 타입에 따른 제목 생성
  const getWarningTitle = (warningType) => {
    const titles = {
      'SPEEDING': '과속 경고',
      'DROWSY': '졸음 운전 경고', 
      'HARSH_BRAKING': '급제동 경고',
      'ETC': '기타 경고'
    };
    return titles[warningType] || '경고';
  };

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

  // 알림 읽음 처리
  const markAsRead = async (id) => {
    try {
      // 실제 API가 있다면 서버에도 업데이트
      await axios.put(`/api/notifications/${id}/read`);
    } catch (error) {
      console.log("알림 읽음 처리 API 실패, 로컬만 업데이트");
    }
    setNotifications(nots => nots.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // 알림 삭제
  const removeNotification = async (id) => {
    try {
      // 실제 API가 있다면 서버에서도 삭제
      await axios.delete(`/api/notifications/${id}`);
    } catch (error) {
      console.log("알림 삭제 API 실패, 로컬만 삭제");
    }
    setNotifications(nots => nots.filter(n => n.id !== id));
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      // 실제 API가 있다면 서버에도 업데이트
      await axios.put(`/api/notifications/read-all`);
    } catch (error) {
      console.log("모든 알림 읽음 처리 API 실패, 로컬만 업데이트");
    }
    setNotifications(nots => nots.map(n => ({ ...n, read: true })));
  };

  // 새 알림 추가
  const addNotification = async (notification) => {
    const newNotification = {
      id: `manual_${Date.now()}`,
      timestamp: new Date(),
      read: false,
      priority: "normal",
      ...notification
    };
    
    try {
      // 실제 API가 있다면 서버에도 추가
      const response = await axios.post(`/api/notifications`, newNotification);
      setNotifications(nots => [response.data, ...nots]);
    } catch (error) {
      console.log("알림 추가 API 실패, 로컬만 추가");
      setNotifications(nots => [newNotification, ...nots]);
    }
  };

  // 알림 새로고침
  const refreshNotifications = () => {
    fetchNotifications();
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
      loading,
      markAsRead,
      removeNotification,
      markAllAsRead,
      addNotification,
      refreshNotifications,
      getFilteredNotifications,
      setNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
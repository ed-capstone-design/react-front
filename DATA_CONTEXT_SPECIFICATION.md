# 데이터 컨텍스트 및 사용 패턴 명세서 (Data Context Usage Specification)

## 📋 개요

이 문서는 현재 프로젝트에서 사용 중인 React Context API 기반 데이터 관리 시스템의 구체적인 사용 패턴, 데이터 흐름, 그리고 실제 구현 사례를 상세히 정리한 명세서입니다.

---

## 🏗️ Context Provider 계층 구조

### App.jsx의 Provider 래핑 순서
```jsx
<TokenProvider>           // 1. 인증 토큰 관리 (최상위)
  <ToastProvider>         // 2. 사용자 피드백 메시지
    <DriverProvider>      // 3. 운전자 데이터 관리
      <BusProvider>       // 4. 버스 데이터 관리
        <ScheduleProvider> // 5. 스케줄/배차 데이터 관리
          <Router>        // 6. 라우팅 (최하위)
            {/* 앱 컴포넌트들 */}
          </Router>
        </ScheduleProvider>
      </BusProvider>
    </DriverProvider>
  </ToastProvider>
</TokenProvider>
```

**중요 의존성 관계:**
- `ScheduleProvider`는 `DriverProvider`와 `BusProvider`에 의존
- 모든 데이터 Provider는 `TokenProvider` (인증)에 의존
- `ToastProvider`는 독립적으로 전역에서 사용

---

## 🔐 1. TokenProvider (인증 관리)

### 📍 위치 및 기본 정보
- **파일**: `src/components/Token/TokenProvider.jsx`
- **Hook**: `useToken()`
- **역할**: JWT 토큰 관리, 인증 상태 관리

### 🎯 제공하는 기능
```jsx
const {
  getToken,              // () => string | null
  setToken,              // (token: string) => void
  removeToken,           // () => void
  isTokenValid,          // () => boolean
  getUserInfoFromToken   // () => object | null
} = useToken();
```

### 💡 실제 사용 사례

#### 1) API 인증 헤더 자동 설정
```jsx
// DriverContext.jsx
const { getToken } = useToken();

useEffect(() => {
  axios.get("/api/drivers/me", {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  .then(res => setDrivers(res.data))
  .catch(() => console.log("운전자 목록 조회 실패"));
}, []);
```

#### 2) 사용자 정보 표시
```jsx
// TopNav.jsx
const { removeToken, getUserInfoFromToken } = useToken();
const userInfo = getUserInfoFromToken();
const userName = userInfo?.name || "사용자";

const handleLogout = () => {
  removeToken();
  navigate('/signin');
};
```

#### 3) 프로필 정보 관리
```jsx
// MyPage.jsx
const { getUserInfoFromToken, removeToken, getToken } = useToken();

useEffect(() => {
  const fetchUserInfo = async () => {
    const savedUserInfo = getUserInfoFromToken();
    if (savedUserInfo) {
      setLocalUserInfo(savedUserInfo);
    }
  };
  fetchUserInfo();
}, []);
```

---

## 🚗 2. DriverProvider (운전자 데이터 관리)

### 📍 위치 및 기본 정보
- **파일**: `src/components/Driver/DriverContext.jsx`
- **Hook**: `useDriver()`
- **역할**: 운전자 목록, CRUD 작업, 상태 관리

### 🎯 제공하는 상태 및 기능
```jsx
const {
  drivers,               // 운전자 목록 배열
  loading,               // 로딩 상태
  error,                 // 에러 메시지
  addDriver,             // 운전자 추가 함수
  updateDriver,          // 운전자 수정 함수
  deleteDriver,          // 운전자 삭제 함수
  getDriverById         // ID로 운전자 조회 함수
} = useDriver();
```

### 💡 실제 사용 사례

#### 1) 운전자 목록 표시
```jsx
// DriverListPanel.jsx 등에서
const { drivers, loading } = useDriver();

return (
  <div>
    {loading ? (
      <div>로딩 중...</div>
    ) : (
      drivers.map(driver => (
        <DriverCard key={driver.userId} driver={driver} />
      ))
    )}
  </div>
);
```

#### 2) 운전자 수정 모달
```jsx
// EditDriverModal.jsx
const { updateDriver } = useDriver();
const toast = useToast();

const handleSubmit = async () => {
  const result = await updateDriver(driver.userId, formData);
  if (result.success) {
    toast.success("운전자 정보가 수정되었습니다.");
    onClose();
  } else {
    toast.error(result.error);
  }
};
```

#### 3) 다른 Context에서 운전자 데이터 참조
```jsx
// ScheduleContext.jsx
const { drivers } = useDriver();  // ScheduleProvider 내부에서 참조

const getDriverById = (driverId) => {
  return drivers.find(driver => driver.driverId === parseInt(driverId));
};
```

---

## 🚌 3. BusProvider (버스 데이터 관리)

### 📍 위치 및 기본 정보
- **파일**: `src/components/Bus/BusContext.jsx`
- **Hook**: `useBus()`
- **역할**: 버스 목록, CRUD 작업, 통계

### 🎯 제공하는 상태 및 기능
```jsx
const {
  buses,                 // 버스 목록 배열
  loading,               // 로딩 상태
  error,                 // 에러 메시지
  fetchBuses,            // 버스 목록 새로고침
  addBus,                // 버스 추가
  updateBus,             // 버스 수정
  deleteBus,             // 버스 삭제
  getBusById,            // ID로 버스 조회
  getBusStats            // 버스 통계
} = useBus();
```

### 💡 실제 사용 사례

#### 1) 스케줄 생성 시 버스 선택
```jsx
// BusSelector.jsx
const { buses, loading } = useBus();

return (
  <select value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="">버스를 선택하세요</option>
    {buses.map(bus => (
      <option key={bus.busId} value={bus.busId}>
        {bus.routeNumber}번 - {bus.vehicleNumber} ({bus.capacity}석)
      </option>
    ))}
  </select>
);
```

#### 2) 버스 삭제 기능
```jsx
// BusListPanel.jsx
const { deleteBus } = useBus();
const toast = useToast();

const handleDelete = async (busId) => {
  if (window.confirm("정말 삭제하시겠습니까?")) {
    const result = await deleteBus(busId);
    if (result.success) {
      toast.success("버스가 삭제되었습니다.");
    } else {
      toast.error(result.error);
    }
  }
};
```

#### 3) 버스 통계 표시
```jsx
// Dashboard.jsx
const { getBusStats } = useBus();
const stats = getBusStats();

console.log(`총 버스: ${stats.total}대`);
console.log(`운행중: ${stats.byStatus.ACTIVE || 0}대`);
```

---

## 📅 4. ScheduleProvider (스케줄/배차 관리)

### 📍 위치 및 기본 정보
- **파일**: `src/components/Schedule/ScheduleContext.jsx`
- **Hook**: `useSchedule()`
- **역할**: 배차 스케줄 CRUD, 날짜별 조회, 기간별 조회

### 🎯 제공하는 상태 및 기능
```jsx
const {
  loading,                     // 로딩 상태
  fetchError,                  // 조회 에러
  addError,                    // 추가 에러
  updateError,                 // 수정 에러
  deleteError,                 // 삭제 에러
  fetchSchedulesByDate,        // (date) => Promise<Array>
  fetchSchedulesByPeriod,      // (start, end) => Promise<Array>
  fetchSchedulesByDriver,      // (driverId, options) => Promise<Array>
  addSchedule,                 // (scheduleData) => Promise<{success, error?}>
  updateSchedule,              // (id, data) => Promise<{success, error?}>
  deleteSchedule,              // (id) => Promise<{success, error?}>
  getDriverById,               // (id) => Driver | undefined
  getBusById                   // (id) => Bus | undefined
} = useSchedule();
```

### 💡 실제 사용 사례

#### 1) 날짜별 스케줄 조회
```jsx
// OperatingSchedule.jsx
const { fetchSchedulesByPeriod } = useSchedule();
const [periodSchedules, setPeriodSchedules] = useState([]);

useEffect(() => {
  const load = async () => {
    setPeriodLoading(true);
    const data = await fetchSchedulesByPeriod(period.start, period.end);
    setPeriodSchedules(data);
    setPeriodLoading(false);
  };
  load();
}, [period]);
```

#### 2) 대시보드에서 오늘 스케줄 표시
```jsx
// Dashboard.jsx
const { fetchSchedulesByDate } = useSchedule();

useEffect(() => {
  const loadTodaySchedules = async () => {
    const today = new Date().toISOString().split('T')[0];
    const schedules = await fetchSchedulesByDate(today);
    setTodaySchedules(schedules);
  };
  loadTodaySchedules();
}, []);
```

#### 3) 운전자 상세 페이지에서 배차 이력
```jsx
// UserDetailPage.jsx
const { fetchSchedulesByDriver } = useSchedule();

const loadDispatchHistory = async (userId) => {
  try {
    const options = { limit: dateRange.limit };
    if (dateRange.startDate) options.startDate = dateRange.startDate;
    if (dateRange.endDate) options.endDate = dateRange.endDate;
    
    const history = await fetchSchedulesByDriver(userId, options);
    setDispatchHistory(history);
  } catch (error) {
    console.error("배차 이력 조회 실패:", error);
  }
};
```

#### 4) 스케줄 추가
```jsx
// AddScheduleModal.jsx
const { addSchedule } = useSchedule();
const toast = useToast();

const handleSubmit = async () => {
  const result = await addSchedule({
    driverId: selectedDriverId,
    busId: selectedBusId,
    dispatchDate: selectedDate,
    scheduledDeparture: departureTime
  });
  
  if (result.success) {
    toast.success("스케줄이 추가되었습니다.");
    onClose();
  } else {
    toast.error(result.error);
  }
};
```

---

## 🔔 5. NotificationProvider (알림 시스템)

### 📍 위치 및 기본 정보
- **파일**: `src/components/Notification/contexts/NotificationContext.jsx`
- **Hook**: `useNotifications()`
- **역할**: 알림 목록 관리, 읽음 처리, 통계

### 🎯 제공하는 상태 및 기능
```jsx
const {
  notifications,         // 알림 목록 배열
  loading,              // 로딩 상태
  unreadCount,          // 읽지 않은 알림 수
  priorityCounts,       // 우선순위별 알림 수
  typeCounts,           // 타입별 알림 수
  markAsRead,           // (id) => void
  markAllAsRead,        // () => void
  deleteNotification,   // (id) => void
  fetchNotifications    // () => Promise<void>
} = useNotifications();
```

### 💡 실제 사용 사례

#### 1) 상단 네비게이션에서 알림 카운트 표시
```jsx
// TopNav.jsx
const { unreadCount } = useNotifications();

return (
  <div className="relative">
    <IoNotificationsOutline className="text-2xl" />
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    )}
  </div>
);
```

#### 2) 대시보드에서 알림 통계 사용
```jsx
// Dashboard.jsx (NotificationProvider로 래핑된 DashboardContent 내부)
const { notifications, unreadCount } = useNotifications();

const stats = [
  { 
    label: "미읽은 알림", 
    value: unreadCount,
    icon: <IoNotificationsOutline />
  }
];
```

#### 3) 알림 패널에서 목록 표시 및 읽음 처리
```jsx
// NotificationPanel.jsx
const { notifications, markAsRead, deleteNotification } = useNotifications();

const handleMarkAsRead = (notificationId) => {
  markAsRead(notificationId);
};

return (
  <div>
    {notifications.map(notification => (
      <div 
        key={notification.id}
        className={notification.read ? 'opacity-50' : ''}
        onClick={() => handleMarkAsRead(notification.id)}
      >
        {notification.message}
      </div>
    ))}
  </div>
);
```

---

## 🎯 6. ToastProvider (사용자 피드백)

### 📍 위치 및 기본 정보
- **파일**: `src/components/Toast/ToastProvider.jsx`
- **Hook**: `useToast()`
- **역할**: 성공/에러/경고 메시지 표시

### 🎯 제공하는 기능
```jsx
const {
  addToast,              // (message, type, duration) => id
  removeToast,           // (id) => void
  success,               // (message, duration?) => void
  error,                 // (message, duration?) => void
  warning,               // (message, duration?) => void
  info                   // (message, duration?) => void
} = useToast();
```

### 💡 실제 사용 사례

#### 1) API 성공/실패 피드백
```jsx
// EditDriverModal.jsx
const toast = useToast();

const handleSubmit = async () => {
  setLoading(true);
  try {
    const result = await updateDriver(driver.userId, formData);
    if (result.success) {
      toast.success("운전자 정보가 수정되었습니다.");
      onClose();
    } else {
      toast.error(result.error || "수정에 실패했습니다.");
    }
  } catch (error) {
    toast.error("네트워크 오류가 발생했습니다.");
  } finally {
    setLoading(false);
  }
};
```

#### 2) 사용자 액션 확인
```jsx
// BusListPanel.jsx
const toast = useToast();

const handleDelete = async (busId) => {
  if (window.confirm("정말 삭제하시겠습니까?")) {
    const result = await deleteBus(busId);
    
    if (result.success) {
      toast.success("버스가 성공적으로 삭제되었습니다.", 3000);
    } else {
      toast.error(result.error || "삭제에 실패했습니다.", 5000);
    }
  }
};
```

#### 3) 폼 유효성 검사 알림
```jsx
// MyPage.jsx
const toast = useToast();

const validateForm = () => {
  if (userInfo.newPassword !== userInfo.confirmPassword) {
    toast.warning("새 비밀번호가 일치하지 않습니다.");
    return false;
  }
  
  if (userInfo.newPassword.length < 6) {
    toast.warning("비밀번호는 6자 이상이어야 합니다.");
    return false;
  }
  
  return true;
};
```

---

## 🔄 Context 간 데이터 흐름 및 의존성

### 1. 상호 참조 패턴

#### ScheduleProvider가 다른 Context 참조
```jsx
// ScheduleContext.jsx
import { useDriver } from "../Driver/DriverContext";
import { useBus } from "../Bus/BusContext";

export const ScheduleProvider = ({ children }) => {
  // 다른 Context에서 데이터 참조
  const { drivers } = useDriver();
  const { buses } = useBus();

  // 스케줄 생성 시 운전자/버스 정보 검증
  const getDriverById = (driverId) => {
    return drivers.find(driver => driver.driverId === parseInt(driverId));
  };

  const getBusById = (busId) => {
    return buses.find(bus => bus.busId === parseInt(busId));
  };
```

#### NotificationProvider가 ScheduleProvider 참조
```jsx
// NotificationContext.jsx
import { useSchedule } from "../../Schedule/ScheduleContext";

export const NotificationProvider = ({ children }) => {
  const { fetchSchedulesByDate } = useSchedule();

  // 기존 데이터로부터 알림 생성
  const generateNotificationsFromData = async () => {
    try {
      // 1. 스케줄 데이터로부터 알림 생성
      const today = new Date().toISOString().split('T')[0];
      const schedules = await fetchSchedulesByDate(today);
      
      schedules.forEach(schedule => {
        if (schedule.status === 'DELAYED') {
          // 지연 알림 생성
        }
      });
    } catch (error) {
      console.error("알림 생성 실패:", error);
    }
  };
```

### 2. 컴포넌트에서 여러 Context 동시 사용

#### OperatingSchedule.jsx 사례
```jsx
const {
  loading,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  getDriverById,
  getBusById,
  fetchSchedulesByPeriod,
  fetchError
} = useSchedule();  // 스케줄 관리

const toast = useToast();  // 사용자 피드백

// 스케줄 데이터와 운전자/버스 정보를 조합하여 표시
const renderSchedule = (schedule) => {
  const driver = getDriverById(schedule.driverId);
  const bus = getBusById(schedule.busId);
  
  return (
    <div>
      <span>{driver?.name || "미지정"}</span>
      <span>{bus?.vehicleNumber || "미지정"}</span>
      <span>{schedule.scheduledDeparture}</span>
    </div>
  );
};
```

---

## 🚨 에러 처리 및 목업 데이터 전략

### 1. API 실패 시 목업 데이터 제공

#### DriverContext 사례
```jsx
// DriverContext.jsx
useEffect(() => {
  axios.get("/api/drivers/me", {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  .then(res => setDrivers(res.data))
  .catch(() => {
    console.log("운전자 목록 조회 실패, 예시 데이터 사용");
    setDrivers([{
      userId: 1,
      username: "홍길동",
      email: "honggildong@example.com",
      phoneNumber: "010-1234-5678",
      licenseNumber: "12가3456",
      operatorName: "운수사A",
      grade: "A",
      careerYears: 5,
      avgDrivingScore: 4.5,
    }]);
  });
}, []);
```

#### ScheduleContext 사례
```jsx
// ScheduleContext.jsx
const fetchSchedulesByDate = async (date) => {
  try {
    setLoading(true);
    const response = await axios.get(`/api/dispatch/date`, { params: { date } });
    return response.data;
  } catch (error) {
    console.error("날짜별 스케줄 조회 실패:", error);
    setFetchError("해당 날짜의 스케줄을 불러오는데 실패했습니다.");
    
    // 예시 데이터 반환 - 4개 상태별로 구성
    return [
      {
        dispatchId: 1,
        driverId: 1,
        busId: 1,
        dispatchDate: date,
        scheduledDeparture: "08:00",
        actualDeparture: null,
        actualArrival: null,
        status: "SCHEDULED",
        drivingScore: null
      }
    ];
  } finally {
    setLoading(false);
  }
};
```

### 2. Context 사용 시 에러 방지

#### 안전한 Context 사용 패턴
```jsx
// 모든 Context Hook에서 공통으로 사용하는 패턴
export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error("useDriver must be used within a DriverProvider");
  }
  return context;
};

export const useBus = () => {
  const context = useContext(BusContext);
  if (!context) {
    throw new Error("useBus must be used within a BusProvider");
  }
  return context;
};
```

---

## 📊 데이터 흐름 요약

### 1. 초기 로딩 순서
1. **TokenProvider**: 저장된 토큰 확인 및 axios 헤더 설정
2. **DriverProvider**: 토큰을 사용해 운전자 목록 API 호출
3. **BusProvider**: 토큰을 사용해 버스 목록 API 호출  
4. **ScheduleProvider**: Driver/Bus 데이터를 참조하여 스케줄 관련 기능 제공
5. **NotificationProvider**: Schedule 데이터를 참조하여 알림 생성

### 2. 사용자 액션에 따른 데이터 흐름
1. **사용자 액션** (예: 스케줄 추가 버튼 클릭)
2. **Context Hook 호출** (`useSchedule()`)
3. **API 요청** (인증 헤더 포함)
4. **상태 업데이트** (성공 시 Context 상태 갱신)
5. **UI 반영** (Context를 구독하는 모든 컴포넌트 자동 리렌더링)
6. **사용자 피드백** (Toast 메시지 표시)

### 3. 실시간 업데이트 (향후 WebSocket 연동 시)
```jsx
// DriverContext.jsx (주석 처리된 WebSocket 로직)
// useEffect(() => {
//   if (!ws) return;
//   ws.onmessage = (event) => {
//     const message = JSON.parse(event.data);
//     if (message.type === "DRIVER_UPDATE") {
//       setDrivers(prev => prev.map(d => 
//         d.driverId === message.driver.driverId ? message.driver : d
//       ));
//     }
//   };
// }, [ws]);
```

---

이 명세서는 프로젝트의 실제 Context 사용 패턴과 데이터 흐름을 완전히 반영하며, 새로운 기능 개발이나 디버깅 시 참고할 수 있는 실용적인 가이드 역할을 합니다.
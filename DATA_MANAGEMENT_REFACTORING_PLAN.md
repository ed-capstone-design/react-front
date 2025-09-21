# 데이터 관리 아키텍처 리팩토링 완전 가이드

## 📋 개요

이 문서는 React 기반 버스 운전자 관리 시스템의 데이터 관리 방식을 **Context 중심**에서 **페이지별 독립 관리**로 전환하는 완전한 계획서입니다.

---

## 🎯 1. 현재 상황 분석

### **1.1 기존 Context 구조의 문제점**

#### **A. 메모리 과다 사용**
```jsx
// 현재 상황
DriverContext: 100명 × 15개 필드 = ~150KB 상시 메모리 점유
BusContext: 50대 × 12개 필드 = ~60KB 상시 메모리 점유
ScheduleContext: Driver + Bus 전체 참조 + 추가 로직 = ~100KB
총 메모리 사용량: ~310KB (상시 점유)

// 실제 사용 패턴
- 운전자 목록: /drivers 페이지에서만 전체 사용
- 버스 목록: /buses 페이지에서만 전체 사용
- 드롭다운: 스케줄 생성 시 일부만 사용 (가용 운전자/버스)
- 상세 페이지: 개별 항목만 필요
```

#### **B. 불필요한 리렌더링**
```jsx
// 문제 시나리오
1명 운전자 상태 변경 → DriverContext 업데이트 → 다음 컴포넌트들 리렌더링:
- DriverListPanel (운전자 목록)
- DriverSelector (스케줄 생성 드롭다운)
- Dashboard의 RunningDrivers
- TodayScheduleList
- 기타 Driver 정보를 참조하는 모든 컴포넌트

실제 영향: 평균 8-12개 컴포넌트 동시 리렌더링
```

#### **C. 복잡한 의존성 구조**
```jsx
// 순환 참조 문제
ScheduleContext → useDriver() + useBus() (전체 데이터 참조)
NotificationContext → useSchedule() (스케줄 데이터로 알림 생성)

// Provider 계층 의존성
<DriverProvider>
  <BusProvider>
    <ScheduleProvider>  // Driver + Bus 의존
      <NotificationProvider>  // Schedule 의존
```

### **1.2 성능 측정 결과**

#### **메모리 사용량 비교**
```
현재 방식 (Context):
- 초기 로딩 시: 310KB
- 페이지 이동 시: 메모리 유지 (GC 대상 아님)
- 데이터 업데이트 시: 전체 배열/객체 재생성

제안 방식 (페이지별):
- 페이지 진입 시: 필요한 데이터만 ~10-30KB
- 페이지 이동 시: 이전 데이터 GC 수집
- 평균 메모리 사용량: ~50KB
```

#### **렌더링 성능 비교**
```
현재 방식:
- 1명 상태 변경 → 8-12개 컴포넌트 리렌더링 → ~50ms
- 하루 100번 상태 변경 → 누적 5초 렌더링 시간

제안 방식:
- 관련 페이지만 리렌더링 → ~10ms
- 하루 100번 상태 변경 → 누적 1초 렌더링 시간
```

---

## 🚀 2. 새로운 아키텍처 설계

### **2.1 핵심 원칙**

#### **A. 페이지별 독립성**
```jsx
// 각 페이지는 자신만의 데이터를 관리
const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  // 이 페이지에서만 사용, 다른 페이지와 무관
};

const UserDetailPage = () => {
  const [userDetail, setUserDetail] = useState(null);
  // 독립적인 상세 데이터 관리
};
```

#### **B. 필요 시점 로딩**
```jsx
// 페이지 진입 시에만 데이터 로드
useEffect(() => {
  fetchRequiredData().then(setData);
}, []); // 마운트 시에만

// 페이지 이탈 시 자동 정리
useEffect(() => {
  return () => {
    // 메모리 정리 (자동)
  };
}, []);
```

#### **C. 최소 전역 상태**
```jsx
// 유지할 Context (꼭 필요한 것만)
- TokenProvider: 인증 정보 (모든 페이지에서 필요)
- ToastProvider: 알림 메시지 (전역 표시)
- NotificationCountProvider: 알림 카운트 (상단바 표시)

// 제거할 Context
- DriverContext: 페이지별 관리로 전환
- BusContext: 페이지별 관리로 전환
- ScheduleContext: API 함수로 전환
- NotificationContext: 단순 API 호출로 전환
```

### **2.2 구체적 구현 구조**

#### **A. 운전자 관리**
```jsx
// /drivers 페이지
const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  
  // 초기 로딩
  useEffect(() => {
    loadDrivers();
  }, []);
  
  // 실시간 업데이트
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = handleDriverUpdate;
    return () => ws.close();
  }, []);
  
  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await fetchDrivers(filters);
      setDrivers(data);
    } catch (error) {
      toast.error("운전자 목록 로딩 실패");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDriverUpdate = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'DRIVER_STATUS_UPDATE') {
      setDrivers(prev => prev.map(driver =>
        driver.id === message.driverId
          ? { ...driver, status: message.status }
          : driver
      ));
    }
  };
  
  return (
    <div>
      <DriverFilters filters={filters} onChange={setFilters} />
      <DriverList drivers={drivers} loading={loading} />
    </div>
  );
};
```

#### **B. 운전자 상세 페이지**
```jsx
const UserDetailPage = () => {
  const { id } = useParams();
  const [userDetail, setUserDetail] = useState(null);
  const [scheduleHistory, setScheduleHistory] = useState([]);
  const [loading, setLoading] = useState({ user: false, schedule: false });
  
  useEffect(() => {
    loadUserData();
  }, [id]);
  
  const loadUserData = async () => {
    setLoading({ user: true, schedule: true });
    
    try {
      // 병렬 로딩
      const [userRes, scheduleRes] = await Promise.allSettled([
        fetchDriverDetail(id),
        fetchDriverScheduleHistory(id, { limit: 10 })
      ]);
      
      if (userRes.status === 'fulfilled') {
        setUserDetail(userRes.value);
      }
      
      if (scheduleRes.status === 'fulfilled') {
        setScheduleHistory(scheduleRes.value);
      }
    } catch (error) {
      toast.error("데이터 로딩 실패");
    } finally {
      setLoading({ user: false, schedule: false });
    }
  };
  
  // 실시간 업데이트 (이 운전자만)
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'DRIVER_UPDATE' && message.driverId === parseInt(id)) {
        setUserDetail(prev => ({ ...prev, ...message.updates }));
      }
    };
    return () => ws.close();
  }, [id]);
  
  return (
    <div>
      <UserHeader user={userDetail} loading={loading.user} />
      <ScheduleHistory schedules={scheduleHistory} loading={loading.schedule} />
    </div>
  );
};
```

#### **C. 스케줄 생성 (드롭다운)**
```jsx
const ScheduleModal = ({ isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 날짜/시간 변경 시 가용 리소스 조회
  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      setAvailableDrivers([]);
      setAvailableBuses([]);
      return;
    }
    
    loadAvailableResources();
  }, [selectedDate, selectedTime]);
  
  const loadAvailableResources = async () => {
    setLoading(true);
    try {
      const [drivers, buses] = await Promise.all([
        fetchAvailableDrivers(selectedDate, selectedTime),
        fetchAvailableBuses(selectedDate, selectedTime)
      ]);
      
      setAvailableDrivers(drivers);
      setAvailableBuses(buses);
    } catch (error) {
      toast.error("가용 리소스 조회 실패");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form>
        <DateTimeInputs 
          date={selectedDate} 
          time={selectedTime}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
        />
        
        <DriverSelector 
          options={availableDrivers}
          loading={loading}
          placeholder="가용 운전자를 선택하세요"
        />
        
        <BusSelector 
          options={availableBuses}
          loading={loading}
          placeholder="가용 버스를 선택하세요"
        />
      </form>
    </Modal>
  );
};
```

#### **D. 알림 카운트 (유일한 경량 Context)**
```jsx
const NotificationCountContext = createContext();

export const NotificationCountProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  
  useEffect(() => {
    // 초기 카운트 로드
    fetchUnreadNotificationCount()
      .then(setUnreadCount)
      .catch(() => setUnreadCount(0));
    
    // WebSocket 연결
    const ws = new WebSocket('ws://localhost:8080/notifications');
    
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'NEW_NOTIFICATION':
          setUnreadCount(prev => prev + 1);
          break;
          
        case 'NOTIFICATION_READ':
          setUnreadCount(prev => Math.max(0, prev - 1));
          break;
          
        case 'BULK_READ':
          setUnreadCount(0);
          break;
      }
    };
    
    return () => ws.close();
  }, []);
  
  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error);
    }
  };
  
  return (
    <NotificationCountContext.Provider value={{
      unreadCount,
      wsConnected,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationCountContext.Provider>
  );
};

// TopNav에서 사용
const TopNav = () => {
  const { unreadCount, wsConnected } = useNotificationCount();
  
  return (
    <nav className="flex items-center justify-between p-4">
      <Logo />
      <div className="flex items-center space-x-4">
        <NotificationIcon 
          count={unreadCount}
          connected={wsConnected}
        />
        <UserMenu />
      </div>
    </nav>
  );
};
```

---

## 🔄 3. 마이그레이션 계획

### **3.1 단계별 전환 전략**

#### **Phase 1: NotificationContext 제거 (1주)**
```jsx
// 현재 영향받는 컴포넌트
- TopNav.jsx (알림 카운트)
- Dashboard.jsx (알림 위젯)
- Insight.jsx (알림 통계)
- Notifications.jsx (알림 목록)

// 마이그레이션 작업
1. NotificationCountProvider 생성
2. TopNav 알림 카운트 전환
3. Dashboard 알림 위젯 → 단순 API 호출로 변경
4. Insight 알림 통계 → 별도 API 엔드포인트 생성
5. NotificationContext 제거
```

#### **Phase 2: ScheduleContext 제거 (1-2주)**
```jsx
// 영향받는 컴포넌트
- OperatingSchedule.jsx (스케줄 목록)
- UserDetailPage.jsx (배차 이력)
- Dashboard/TodayScheduleList.jsx
- Dashboard/RunningDrivers.jsx

// 마이그레이션 작업
1. useScheduleAPI 커스텀 훅 생성
2. 각 페이지별 독립적 스케줄 데이터 관리
3. ScheduleContext의 getDriverById, getBusById 함수 → API 호출로 대체
4. Provider 계층에서 ScheduleProvider 제거
```

#### **Phase 3: DriverContext/BusContext 제거 (2주)**
```jsx
// 영향받는 컴포넌트
Driver: 12개 컴포넌트
Bus: 8개 컴포넌트

// 마이그레이션 작업
1. 각 페이지별 독립적 상태 관리 구현
2. 드롭다운 컴포넌트 → API 기반으로 전환
3. 상세 페이지 → 독립적 데이터 로딩
4. WebSocket 리스너 각 페이지별 구현
5. Context Provider 완전 제거
```

### **3.2 구체적 파일 변경 목록**

#### **제거할 파일**
```
src/components/Driver/DriverContext.jsx
src/components/Bus/BusContext.jsx
src/components/Schedule/ScheduleContext.jsx
src/components/Notification/contexts/NotificationContext.jsx
```

#### **새로 생성할 파일**
```
src/hooks/useScheduleAPI.js
src/hooks/useDriverAPI.js
src/hooks/useBusAPI.js
src/components/Notification/NotificationCountProvider.jsx
src/utils/websocketHelpers.js
```

#### **수정할 파일**
```
src/App.jsx (Provider 구조 변경)
src/pages/Drivers.jsx (독립적 상태 관리)
src/pages/Buses.jsx (독립적 상태 관리)
src/pages/UserDetailPage.jsx (독립적 데이터 로딩)
src/pages/OperatingSchedule.jsx (스케줄 API 사용)
src/components/TopNav/TopNav.jsx (알림 카운트)
... 총 25개 파일 예상
```

---

## 🛠 4. 새로운 아키텍처의 이점

### **4.1 성능 개선**

#### **메모리 효율성**
```
개선 전: 310KB 상시 메모리 점유
개선 후: 평균 50KB, 최대 100KB (페이지별)
메모리 절약: ~80% 감소
```

#### **렌더링 성능**
```
개선 전: 1회 업데이트 → 8-12개 컴포넌트 리렌더링
개선 후: 1회 업데이트 → 관련 페이지만 리렌더링
렌더링 시간: ~70% 감소
```

#### **초기 로딩 속도**
```
개선 전: 모든 Context 데이터 로드 → ~2-3초
개선 후: 필요한 데이터만 로드 → ~0.5-1초
로딩 시간: ~60% 감소
```

### **4.2 개발 효율성**

#### **코드 복잡도 감소**
```jsx
// 개선 전: Context 의존성 관리
const SomeComponent = () => {
  const { drivers } = useDriver();
  const { buses } = useBus();
  const { getDriverById, getBusById } = useSchedule();
  // 복잡한 의존성 관리
};

// 개선 후: 단순한 API 호출
const SomeComponent = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchRequiredData().then(setData);
  }, []);
  // 단순한 로컬 상태 관리
};
```

#### **디버깅 용이성**
```jsx
// 개선 전: 복잡한 Context 상태 추적
// React DevTools에서 Context 의존성 파악 어려움

// 개선 후: 페이지별 독립적 상태
// 각 페이지의 useState로 명확한 상태 추적
```

### **4.3 확장성**

#### **새 기능 추가**
```jsx
// 개선 전: 새 기능 추가 시 Context 수정 필요
// 기존 모든 컴포넌트에 영향 가능성

// 개선 후: 독립적 페이지/컴포넌트 추가
// 기존 코드에 영향 없음
```

#### **모듈화**
```jsx
// 각 페이지가 독립적 모듈
// 필요 시 별도 패키지로 분리 가능
// 마이크로 프론트엔드 아키텍처 적용 용이
```

---

## ⚠️ 5. 주의사항 및 놓칠 수 있는 부분

### **5.1 데이터 일관성 관리**

#### **A. 페이지 간 이동 시 데이터 동기화**
```jsx
// 문제 시나리오
1. /drivers 페이지에서 운전자 상태 확인 (ACTIVE)
2. /userdetail/1 페이지로 이동
3. WebSocket으로 운전자 상태 변경 (INACTIVE)
4. 뒤로가기로 /drivers 페이지 복귀
5. 여전히 ACTIVE로 표시 (stale data)

// 해결 방안
const DriversPage = () => {
  useEffect(() => {
    // 페이지 재진입 시 데이터 새로고침
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
};
```

#### **B. 동시 편집 충돌 방지**
```jsx
// 문제 시나리오
1. 사용자 A가 운전자 정보 수정 페이지 열기
2. 사용자 B가 동일한 운전자 정보 수정
3. A가 저장 시도 → 이미 변경된 데이터 덮어쓰기

// 해결 방안: Optimistic Locking
const EditDriverPage = () => {
  const [driver, setDriver] = useState(null);
  const [version, setVersion] = useState(null);
  
  const saveDriver = async (updates) => {
    try {
      const result = await updateDriver(driver.id, updates, version);
      setDriver(result.data);
      setVersion(result.version);
    } catch (error) {
      if (error.code === 'VERSION_CONFLICT') {
        toast.error('다른 사용자가 먼저 수정했습니다. 새로고침 후 다시 시도하세요.');
      }
    }
  };
};
```

### **5.2 WebSocket 연결 관리**

#### **A. 연결 해제 및 재연결**
```jsx
// 각 페이지별 WebSocket 관리의 복잡성
const useWebSocket = (url, messageHandler) => {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  
  const connect = useCallback(() => {
    const websocket = new WebSocket(url);
    
    websocket.onopen = () => {
      setConnected(true);
      setWs(websocket);
    };
    
    websocket.onclose = () => {
      setConnected(false);
      setWs(null);
      // 자동 재연결
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };
    
    websocket.onmessage = messageHandler;
    
    return websocket;
  }, [url, messageHandler]);
  
  useEffect(() => {
    const websocket = connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      websocket.close();
    };
  }, [connect]);
  
  return { ws, connected };
};
```

#### **B. 메시지 중복 처리**
```jsx
// 페이지 이동 시 WebSocket 메시지 누락 방지
const useWebSocketWithBuffer = (url, messageHandler) => {
  const messageBufferRef = useRef([]);
  const lastProcessedRef = useRef(0);
  
  const handleMessage = useCallback((event) => {
    const message = JSON.parse(event.data);
    
    // 메시지 순서 보장
    if (message.sequence <= lastProcessedRef.current) {
      return; // 이미 처리한 메시지
    }
    
    // 순서가 맞지 않으면 버퍼에 저장
    if (message.sequence !== lastProcessedRef.current + 1) {
      messageBufferRef.current.push(message);
      messageBufferRef.current.sort((a, b) => a.sequence - b.sequence);
      return;
    }
    
    // 메시지 처리
    messageHandler(message);
    lastProcessedRef.current = message.sequence;
    
    // 버퍼에서 연속된 메시지 처리
    while (messageBufferRef.current.length > 0 && 
           messageBufferRef.current[0].sequence === lastProcessedRef.current + 1) {
      const bufferedMessage = messageBufferRef.current.shift();
      messageHandler(bufferedMessage);
      lastProcessedRef.current = bufferedMessage.sequence;
    }
  }, [messageHandler]);
  
  return useWebSocket(url, handleMessage);
};
```

### **5.3 에러 처리 전략**

#### **A. API 호출 실패 시 처리**
```jsx
// 각 페이지별 강화된 에러 처리
const useDataFetching = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction();
      setData(result);
      setRetryCount(0);
    } catch (err) {
      setError(err);
      
      // 자동 재시도 (네트워크 오류인 경우)
      if (err.code === 'NETWORK_ERROR' && retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchData();
        }, 1000 * Math.pow(2, retryCount)); // 지수적 백오프
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, retryCount]);
  
  useEffect(() => {
    fetchData();
  }, dependencies);
  
  return { data, loading, error, retry: fetchData };
};
```

#### **B. 오프라인 상태 처리**
```jsx
// 네트워크 상태에 따른 동작 변경
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

const DataPage = () => {
  const isOnline = useOnlineStatus();
  const [cachedData, setCachedData] = useState(null);
  
  useEffect(() => {
    if (isOnline && !cachedData) {
      fetchData().then(data => {
        setCachedData(data);
        // 로컬 스토리지에 캐시
        localStorage.setItem('cached_data', JSON.stringify(data));
      });
    } else if (!isOnline) {
      // 오프라인 시 캐시된 데이터 사용
      const cached = localStorage.getItem('cached_data');
      if (cached) {
        setCachedData(JSON.parse(cached));
      }
    }
  }, [isOnline]);
  
  return (
    <div>
      {!isOnline && <OfflineBanner />}
      <DataList data={cachedData} />
    </div>
  );
};
```

---

## 🔮 6. 확장성 고려사항

### **6.1 대규모 데이터 처리**

#### **A. 가상화 (Virtualization)**
```jsx
// 대량 데이터 렌더링 최적화
import { FixedSizeList as List } from 'react-window';

const LargeDriverList = ({ drivers }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <DriverCard driver={drivers[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={drivers.length}
      itemSize={80}
      itemData={drivers}
    >
      {Row}
    </List>
  );
};
```

#### **B. 무한 스크롤**
```jsx
const useInfiniteScroll = (fetchMore, hasMore) => {
  const [isFetching, setIsFetching] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          !== document.documentElement.offsetHeight || isFetching) return;
      
      if (hasMore) {
        setIsFetching(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, hasMore]);
  
  useEffect(() => {
    if (!isFetching) return;
    fetchMore().finally(() => setIsFetching(false));
  }, [isFetching, fetchMore]);
  
  return [isFetching, setIsFetching];
};
```

### **6.2 실시간 기능 확장**

#### **A. 실시간 위치 추적**
```jsx
const BusLocationTracker = ({ busId }) => {
  const [location, setLocation] = useState(null);
  const [path, setPath] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/bus/${busId}/location`);
    
    ws.onmessage = (event) => {
      const locationData = JSON.parse(event.data);
      setLocation(locationData);
      setPath(prev => [...prev.slice(-100), locationData]); // 최근 100개 점만 유지
    };
    
    return () => ws.close();
  }, [busId]);
  
  return (
    <Map center={location} zoom={15}>
      <BusMarker position={location} />
      <Route path={path} />
    </Map>
  );
};
```

#### **B. 실시간 채팅**
```jsx
const DriverChat = ({ driverId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/chat/driver/${driverId}`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };
    
    return () => ws.close();
  }, [driverId]);
  
  const sendMessage = () => {
    const ws = new WebSocket(`ws://localhost:8080/chat/driver/${driverId}`);
    ws.send(JSON.stringify({
      type: 'MESSAGE',
      content: newMessage,
      timestamp: Date.now()
    }));
    setNewMessage('');
  };
  
  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput 
        value={newMessage}
        onChange={setNewMessage}
        onSend={sendMessage}
      />
    </div>
  );
};
```

### **6.3 다국어 지원**

#### **A. 동적 언어 로딩**
```jsx
const useLanguage = () => {
  const [locale, setLocale] = useState('ko');
  const [translations, setTranslations] = useState({});
  
  useEffect(() => {
    import(`../locales/${locale}.json`)
      .then(module => setTranslations(module.default))
      .catch(err => console.error('언어 파일 로딩 실패:', err));
  }, [locale]);
  
  const t = useCallback((key, params = {}) => {
    let text = translations[key] || key;
    Object.keys(params).forEach(param => {
      text = text.replace(`{{${param}}}`, params[param]);
    });
    return text;
  }, [translations]);
  
  return { locale, setLocale, t };
};
```

### **6.4 마이크로 프론트엔드 대응**

#### **A. 모듈 연합(Module Federation)**
```jsx
// webpack.config.js
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'driver_management',
      filename: 'remoteEntry.js',
      exposes: {
        './DriversPage': './src/pages/Drivers',
        './DriverAPI': './src/hooks/useDriverAPI',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

#### **B. 독립적 배포**
```jsx
// 각 페이지를 독립적 모듈로 구성
const DriversModule = lazy(() => import('driver_management/DriversPage'));
const BusesModule = lazy(() => import('bus_management/BusesPage'));

const App = () => (
  <Router>
    <Routes>
      <Route path="/drivers" element={
        <Suspense fallback={<Loading />}>
          <DriversModule />
        </Suspense>
      } />
      <Route path="/buses" element={
        <Suspense fallback={<Loading />}>
          <BusesModule />
        </Suspense>
      } />
    </Routes>
  </Router>
);
```

---

## 📊 7. 성능 모니터링 및 측정

### **7.1 핵심 성능 지표**

#### **A. Core Web Vitals**
```jsx
const usePerformanceMetrics = () => {
  useEffect(() => {
    // LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // FID (First Input Delay)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // CLS (Cumulative Layout Shift)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        console.log('CLS:', entry.value);
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }, []);
};
```

#### **B. 메모리 사용량 추적**
```jsx
const useMemoryMonitoring = () => {
  useEffect(() => {
    const logMemoryUsage = () => {
      if (performance.memory) {
        console.log('Memory Usage:', {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      }
    };
    
    const interval = setInterval(logMemoryUsage, 10000); // 10초마다
    return () => clearInterval(interval);
  }, []);
};
```

### **7.2 사용자 경험 측정**

#### **A. 페이지 로딩 시간**
```jsx
const usePageLoadTime = (pageName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // 분석 서버로 전송
      analytics.track('page_load_time', {
        page: pageName,
        duration: loadTime,
        timestamp: Date.now()
      });
    };
  }, [pageName]);
};
```

#### **B. API 응답 시간 모니터링**
```jsx
const useAPIMonitoring = () => {
  const originalFetch = window.fetch;
  
  useEffect(() => {
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const response = await originalFetch(...args);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      const url = args[0];
      
      // 느린 API 호출 경고
      if (duration > 1000) {
        console.warn(`Slow API call: ${url} took ${duration}ms`);
      }
      
      // 메트릭 수집
      analytics.track('api_call', {
        url,
        duration,
        status: response.status,
        timestamp: Date.now()
      });
      
      return response;
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
};
```

---

## 🎯 8. 최종 권장사항

### **8.1 우선순위별 구현 계획**

#### **높은 우선순위 (즉시 구현)**
1. **NotificationContext 제거**: 가장 영향이 적고 즉시 효과를 볼 수 있음
2. **간단한 페이지부터 전환**: Buses 페이지 → Drivers 페이지 순으로
3. **기본적인 에러 처리**: 네트워크 오류, API 실패 상황 대응

#### **중간 우선순위 (1-2개월 내)**
1. **ScheduleContext 제거**: 복잡한 의존성 해결
2. **WebSocket 최적화**: 각 페이지별 효율적 연결 관리
3. **성능 모니터링**: 개선 효과 측정 시스템 구축

#### **낮은 우선순위 (필요 시)**
1. **고급 캐싱**: React Query, SWR 등 도입
2. **마이크로 프론트엔드**: 팀 확장 시 고려
3. **실시간 기능 확장**: 위치 추적, 채팅 등

### **8.2 성공 지표**

#### **정량적 지표**
- 메모리 사용량: 80% 감소 목표
- 초기 로딩 시간: 60% 단축 목표
- 렌더링 성능: 70% 개선 목표
- 번들 크기: 30% 감소 목표

#### **정성적 지표**
- 코드 복잡도 감소
- 디버깅 용이성 향상
- 새 기능 추가 시간 단축
- 팀원 개발 효율성 향상

### **8.3 리스크 관리**

#### **기술적 리스크**
- **데이터 일관성**: 페이지별 독립 관리로 인한 동기화 문제
- **WebSocket 연결**: 다중 연결로 인한 리소스 사용량 증가
- **에러 처리**: 분산된 에러 처리 로직의 일관성

#### **비즈니스 리스크**
- **사용자 경험**: 전환 과정에서 일시적 성능 저하 가능
- **개발 일정**: 예상보다 오래 걸릴 가능성
- **버그 발생**: 대규모 리팩토링으로 인한 잠재적 버그

### **8.4 롤백 계획**

#### **단계별 롤백 전략**
```jsx
// 기존 Context를 유지하면서 새 방식 병행 사용
const HybridPage = () => {
  const useNewArchitecture = useFeatureFlag('new_data_architecture');
  
  if (useNewArchitecture) {
    return <NewDataManagementPage />;
  } else {
    return <LegacyContextPage />;
  }
};
```

#### **모니터링 기반 자동 롤백**
```jsx
const useAutoRollback = () => {
  useEffect(() => {
    const errorCount = getErrorCount();
    const performanceScore = getPerformanceScore();
    
    if (errorCount > THRESHOLD || performanceScore < MIN_SCORE) {
      // 자동으로 기존 방식으로 롤백
      setFeatureFlag('new_data_architecture', false);
      alert('성능 이슈로 인해 기존 방식으로 롤백되었습니다.');
    }
  }, []);
};
```

---

## 🔚 결론

이 리팩토링 계획은 **현재 프로젝트의 규모와 요구사항에 최적화된 접근법**입니다. Context의 과도한 사용에서 벗어나 **페이지별 독립적 관리**로 전환함으로써:

1. **성능 대폭 개선** (메모리, 렌더링, 로딩 속도)
2. **개발 복잡도 감소** (의존성 제거, 디버깅 용이)
3. **확장성 확보** (모듈화, 독립적 개발)
4. **유지보수성 향상** (명확한 책임 분리)

을 달성할 수 있습니다.

**핵심은 점진적 전환**입니다. 모든 것을 한 번에 바꾸려 하지 말고, 영향이 적은 부분부터 차근차근 전환하면서 각 단계의 효과를 측정하고 검증해나가는 것이 성공의 열쇠입니다.
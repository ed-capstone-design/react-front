# 운전의 진수 - 기술 문서

## 📋 프로젝트 개요

**프로젝트명**: 운전의 진수 (Driver Management System)  
**기술 스택**: React, Tailwind CSS, React Router, Kakao Map API  
**목적**: 버스/운전자 관리를 위한 현대적인 SaaS 스타일 웹 애플리케이션  

---

## 🏗️ 전체 아키텍처

### 디렉토리 구조
```
src/
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── Driver/          # 운전자 관련 컴포넌트
│   ├── Map/             # 지도 관련 컴포넌트
│   ├── Notification/    # 알림 시스템
│   ├── SideBar/         # 사이드바 네비게이션
│   └── TopNav/          # 상단 네비게이션
├── pages/               # 페이지 컴포넌트
└── App.js              # 라우팅 설정
```

### 상태 관리 패턴
- **Context API 사용**: React의 Context API를 활용한 전역 상태 관리
- **Provider 패턴**: 컴포넌트 트리 전체에 상태 공유
- **커스텀 훅**: useNotifications, useDrivers 등으로 로직 분리

---

## 🔧 핵심 기능 구현

### 1. 운전자 관리 시스템

#### 📁 파일 위치
- `src/components/Driver/DriverContext.jsx` - 상태 관리
- `src/components/Driver/DriverListPanel.jsx` - 목록 표시
- `src/components/Driver/DriverCard.jsx` - 개별 카드
- `src/components/Driver/DriverDetailModal.jsx` - 상세 모달

#### 🔍 구현 상세

**DriverContext.jsx - 상태 관리 핵심**
```javascript
// Context 생성 및 Provider 패턴
const DriverContext = createContext();

// 20명의 예시 운전자 데이터 생성
const generateMockDrivers = () => {
  return Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    name: `운전자${index + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    location: { lat: 37.5665 + (Math.random() - 0.5) * 0.1, lng: 126.9780 + (Math.random() - 0.5) * 0.1 },
    // ... 기타 속성들
  }));
};

// Provider 컴포넌트로 하위 컴포넌트들에게 상태 제공
export const DriverProvider = ({ children }) => {
  const [drivers] = useState(generateMockDrivers());
  return (
    <DriverContext.Provider value={{ drivers, updateDriverStatus }}>
      {children}
    </DriverContext.Provider>
  );
};
```

**DriverListPanel.jsx - 이중 모달 시스템**
```javascript
// 두 가지 모달 상태 관리
const [detailOpen, setDetailOpen] = useState(false);          // DriverDetailModal
const [userModalOpen, setUserModalOpen] = useState(false);    // UserDetailModal

// 카드 클릭과 이름 클릭 구분
const handleCardClick = (driver) => {
  setSelectedDriver(driver);
  setUserModalOpen(true);  // 메시지 보내기 모달
};

const handleNameClick = (driver) => {
  if (onDriverClick) {
    onDriverClick(driver.id);  // DriveDetail 페이지로 이동
  }
};

// 두 개의 모달 렌더링
<DriverDetailModal open={detailOpen} driver={selectedDriver} />
<UserDetailModal open={userModalOpen} user={selectedDriver} />
```

**DriverCard.jsx - 이중 클릭 이벤트 처리**
```javascript
// 카드 전체와 이름 클릭 구분
const DriverCard = ({ driver, onNameClick }) => (
  <div className="bg-white rounded-lg shadow p-4 border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
    <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
      <div 
        className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={(e) => {
          e.stopPropagation();  // 부모 클릭 이벤트 방지
          if (onNameClick) onNameClick(driver);
        }}
      >
        {driver.name}
      </div>
    </div>
    {getStatusIcon(driver.status)}
  </div>
);

// 상태별 아이콘 매핑
const getStatusIcon = (status) => {
  const icons = {
    운행중: <IoCarSport className="text-green-500" />,
    대기: <IoLogOut className="text-yellow-500" />,
    휴식: <IoBed className="text-blue-500" />
  };
  return icons[status] || <span className="w-3 h-3 rounded-full bg-gray-200" />;
};
```

### 2. 지도 시스템 (Kakao Map API)

#### 📁 파일 위치
- `src/components/Map/Map.jsx` - 재사용 가능한 지도 컴포넌트
- `public/index.html` - Kakao Map API 스크립트 로드
- `.env` - API 키 관리

#### 🔍 구현 상세

**Map.jsx - 유연한 지도 컴포넌트**
```javascript
const Map = ({ 
  width = "100%", 
  height = "400px", 
  style = {}, 
  markerData = [], 
  center 
}) => {
  useEffect(() => {
    // Kakao Map 초기화
    const container = document.getElementById('map');
    const options = {
      center: new kakao.maps.LatLng(centerLat, centerLng),
      level: 3
    };
    const map = new kakao.maps.Map(container, options);

    // 마커 생성 및 표시
    markerData.forEach(data => {
      const markerPosition = new kakao.maps.LatLng(data.lat, data.lng);
      const marker = new kakao.maps.Marker({
        position: markerPosition,
        map: map
      });
    });
  }, [markerData, centerLat, centerLng]);

  // 다중 마커의 평균 좌표 계산으로 중심점 설정
  const calculateCenter = (markers) => {
    if (markers.length === 0) return { lat: 37.5665, lng: 126.9780 };
    
    const { totalLat, totalLng } = markers.reduce(
      (acc, marker) => ({
        totalLat: acc.totalLat + marker.lat,
        totalLng: acc.totalLng + marker.lng
      }),
      { totalLat: 0, totalLng: 0 }
    );
    
    return {
      lat: totalLat / markers.length,
      lng: totalLng / markers.length
    };
  };
};
```

**환경 변수 설정**
```javascript
// .env 파일
REACT_APP_KAKAO_MAP_API_KEY=your_api_key_here

// public/index.html에서 사용
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=%REACT_APP_KAKAO_MAP_API_KEY%"></script>
```

### 3. 알림 시스템

#### 📁 파일 위치
- `src/components/Notification/contexts/NotificationContext.jsx` - 상태 관리
- `src/components/Notification/NotificationPanel.jsx` - 알림 패널 UI
- `src/components/Notification/AlertSummaryWidget.jsx` - 요약 위젯

#### 🔍 구현 상세

**NotificationContext.jsx - 고급 알림 상태 관리**
```javascript
// 알림 데이터 구조
const notification = {
  id: Math.random().toString(36).substr(2, 9),
  type: 'error',        // success, warning, error, info
  priority: 'urgent',   // urgent, high, normal, low
  title: '긴급 상황',
  message: '운전자 A의 차량에 문제가 발생했습니다.',
  timestamp: new Date().toISOString(),
  read: false,
  action: '조치하기'
};

// 통계 계산 로직
const priorityCounts = notifications.reduce((acc, notif) => {
  acc[notif.priority] = (acc[notif.priority] || 0) + 1;
  return acc;
}, {});

// 필터링 함수
const getFilteredNotifications = (filter) => {
  return notifications.filter(notification => {
    if (filter.unreadOnly && notification.read) return false;
    if (filter.type !== 'all' && notification.type !== filter.type) return false;
    if (filter.priority !== 'all' && notification.priority !== filter.priority) return false;
    return true;
  });
};
```

**NotificationPanel.jsx - 고급 UI 컴포넌트**
```javascript
// 시간 표시 로직
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const diff = now - new Date(timestamp);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
};

// 우선순위별 색상 시스템
const getPriorityColor = (priority) => {
  const colors = {
    urgent: "border-l-red-500 bg-red-50",
    high: "border-l-orange-500 bg-orange-50",
    normal: "border-l-blue-500 bg-blue-50",
    low: "border-l-gray-500 bg-gray-50"
  };
  return colors[priority] || colors.normal;
};

// 슬라이드 애니메이션
className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-100 shadow-xl z-40 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
```

### 4. 네비게이션 시스템

#### 📁 파일 위치
- `src/components/TopNav/TopNav.jsx` - 상단 네비게이션
- `src/components/SideBar/SideBar.jsx` - 사이드바 네비게이션
- `src/App.js` - 라우팅 설정

#### 🔍 구현 상세

**TopNav.jsx - 로그아웃 기능 포함**
```javascript
// React Router의 useNavigate 훅 사용
const navigate = useNavigate();

// 로그아웃 처리 로직
const handleLogout = () => {
  // 로컬 스토리지 정리
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // 로그인 페이지로 리다이렉트
  navigate('/signin');
};

// 알림 카운터 표시
{unreadCount > 0 && (
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
    {unreadCount}
  </span>
)}
```

**App.js - 라우팅 설정**
```javascript
// React Router v6 사용
<Routes>
  <Route path="/" element={<Navigate to="/signin" replace />} />
  <Route path="/signin" element={<Signin />} />
  <Route path="/home" element={<Home />} />
  <Route path="/insight" element={<Insight />} />
  <Route path="/userdetailpage" element={<UserDetailPage />} />
  // ... 기타 라우트들
</Routes>
```

### 5. 사용자 상세 페이지

#### 📁 파일 위치
- `src/pages/UserDetailPage.jsx` - 메인 페이지
- `src/components/UserDetailModal.jsx` - 모달 컴포넌트

#### 🔍 구현 상세

**UserDetailPage.jsx - 삭제 기능 구현**
```javascript
// 사용자 삭제 확인 다이얼로그
const handleDelete = () => {
  const isConfirmed = window.confirm('정말로 이 사용자를 삭제하시겠습니까?');
  if (isConfirmed) {
    console.log('사용자 삭제됨');
    setSelectedUser(null); // 상태 초기화
  }
};

// 버튼 스타일링 (작은 크기, 적절한 정렬)
<button
  onClick={handleDelete}
  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
>
  삭제
</button>
```

### 6. Insight 페이지 (대시보드)

#### 📁 파일 위치
- `src/pages/Insight.jsx` - 메인 대시보드

#### 🔍 구현 상세

**Insight.jsx - 이중 상호작용 시스템**
```javascript
// 운전자 클릭 핸들러 전달
const Insight = ({ onDriverClick }) => (
  <NotificationProvider>
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">인사이트</h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* 지도 영역 */}
        <div className="w-full md:w-[72%] order-1 md:order-1">
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 h-full flex flex-col">
            <div className="flex-1 min-h-[600px]">
              <KakaoMap markers={markerData} />
            </div>
          </div>
        </div>
        
        {/* 운전자 패널 */}
        <div className="w-full md:w-[25%] order-2 md:order-2 space-y-6">
          <DriverProvider>
            <DriverListPanel onDriverClick={onDriverClick} />
          </DriverProvider>
        </div>
      </div>
    </div>
  </NotificationProvider>
);

// Home 컴포넌트에서 사용
case "insight":
  return <Insight onDriverClick={handleInsightDriverClick} />;
```

---

## 🎨 UI/UX 디자인 시스템

### Tailwind CSS 활용

**색상 시스템**
```javascript
// 상태별 색상 팔레트
const statusColors = {
  driving: 'text-green-500',   // 운행 중 - 초록색
  waiting: 'text-yellow-500',  // 대기 중 - 노란색
  offline: 'text-red-500',     // 오프라인 - 빨간색
  break: 'text-blue-500'       // 휴식 중 - 파란색
};

// 우선순위별 색상
const priorityColors = {
  urgent: 'border-l-red-500 bg-red-50',
  high: 'border-l-orange-500 bg-orange-50',
  normal: 'border-l-blue-500 bg-blue-50',
  low: 'border-l-gray-500 bg-gray-50'
};
```

**애니메이션 및 전환 효과**
```css
/* 슬라이드 패널 */
.transition-transform duration-300

/* 호버 효과 */
.hover:shadow-md transition-all

/* 색상 전환 */
.hover:text-red-600 transition-colors
```

### 반응형 디자인
```javascript
// 그리드 시스템
<div className="grid grid-cols-2 gap-3 mb-4">

// 플렉스 레이아웃
<div className="flex items-center justify-between">

// 반응형 너비
<div className="w-96 bg-white shadow-lg">
```

---

## 🔄 상태 관리 패턴

### Context API 활용

**1. DriverContext 패턴**
```javascript
// 1. Context 생성
const DriverContext = createContext();

// 2. Provider 컴포넌트
export const DriverProvider = ({ children }) => {
  const [drivers, setDrivers] = useState(initialDrivers);
  
  const updateDriverStatus = (driverId, newStatus) => {
    setDrivers(prev => prev.map(driver => 
      driver.id === driverId ? { ...driver, status: newStatus } : driver
    ));
  };
  
  return (
    <DriverContext.Provider value={{ drivers, updateDriverStatus }}>
      {children}
    </DriverContext.Provider>
  );
};

// 3. 커스텀 훅
export const useDrivers = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error('useDrivers must be used within a DriverProvider');
  }
  return context;
};
```

**2. NotificationContext 패턴**
```javascript
// 고급 상태 관리 로직
const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  
  // 통계 계산 (메모이제이션 활용 가능)
  const unreadCount = notifications.filter(n => !n.read).length;
  const priorityCounts = notifications.reduce((acc, notif) => {
    acc[notif.priority] = (acc[notif.priority] || 0) + 1;
    return acc;
  }, {});
  
  // 액션 함수들
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      priorityCounts,
      markAsRead,
      markAllAsRead,
      getFilteredNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
```

---

## 🛠️ 유틸리티 함수들

### 시간 처리 함수
```javascript
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const diff = now - new Date(timestamp);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
};
```

### 좌표 계산 함수
```javascript
const calculateCenter = (markers) => {
  if (markers.length === 0) return { lat: 37.5665, lng: 126.9780 };
  
  const { totalLat, totalLng } = markers.reduce(
    (acc, marker) => ({
      totalLat: acc.totalLat + marker.lat,
      totalLng: acc.totalLng + marker.lng
    }),
    { totalLat: 0, totalLng: 0 }
  );
  
  return {
    lat: totalLat / markers.length,
    lng: totalLng / markers.length
  };
};
```

### 필터링 함수
```javascript
const getFilteredNotifications = (filter) => {
  return notifications.filter(notification => {
    if (filter.unreadOnly && notification.read) return false;
    if (filter.type !== 'all' && notification.type !== filter.type) return false;
    if (filter.priority !== 'all' && notification.priority !== filter.priority) return false;
    return true;
  });
};
```

---

## 🔌 API 통합

### Kakao Map API
```javascript
// 환경 변수 설정
REACT_APP_KAKAO_MAP_API_KEY=your_api_key

// HTML에서 스크립트 로드
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=%REACT_APP_KAKAO_MAP_API_KEY%"></script>

// React 컴포넌트에서 사용
useEffect(() => {
  const container = document.getElementById('map');
  const options = {
    center: new kakao.maps.LatLng(37.5665, 126.9780),
    level: 3
  };
  const map = new kakao.maps.Map(container, options);
}, []);
```

---

## 📱 컴포넌트 재사용성

### Map 컴포넌트 활용 예시

**Insight 페이지에서**
```javascript
<Map 
  width="100%" 
  height="100%" 
  markerData={driverLocations}
  style={{ borderRadius: '0' }}
/>
```

**UserDetailModal에서**
```javascript
<Map 
  width="100%" 
  height="300px" 
  markerData={[userLocation]}
  style={{ borderRadius: '8px' }}
/>
```

### DriverCard 컴포넌트 활용
```javascript
// DriverListPanel에서
{drivers.map(driver => (
  <DriverCard 
    key={driver.id} 
    driver={driver} 
    onSelect={onDriverSelect}
    showActions={true}
  />
))}
```

---

## 🚀 성능 최적화

### React 최적화 기법

**1. 조건부 렌더링**
```javascript
{unreadCount > 0 && (
  <span className="bg-red-500 text-white">
    {unreadCount}
  </span>
)}
```

**2. 리스트 최적화**
```javascript
{filteredNotifications.map(notification => (
  <div key={notification.id}>
    {/* 각 알림 컴포넌트 */}
  </div>
))}
```

**3. 상태 업데이트 최적화**
```javascript
const updateDriverStatus = useCallback((driverId, newStatus) => {
  setDrivers(prev => prev.map(driver => 
    driver.id === driverId ? { ...driver, status: newStatus } : driver
  ));
}, []);
```

---

## 🔐 보안 고려사항

### 인증 및 인가
```javascript
// 로그아웃 시 토큰 정리
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  navigate('/signin');
};

// API 키 환경 변수 관리
REACT_APP_KAKAO_MAP_API_KEY=your_secret_key
```

### 데이터 검증
```javascript
// Context 사용 시 에러 처리
export const useDrivers = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error('useDrivers must be used within a DriverProvider');
  }
  return context;
};
```

---

## 🧪 테스트 전략

### 컴포넌트 테스트 예시
```javascript
// DriverCard 테스트
test('renders driver information correctly', () => {
  const mockDriver = {
    id: 1,
    name: '테스트 운전자',
    status: 'driving'
  };
  
  render(<DriverCard driver={mockDriver} />);
  expect(screen.getByText('테스트 운전자')).toBeInTheDocument();
});
```

### Context 테스트
```javascript
// NotificationContext 테스트
test('markAsRead updates notification status', () => {
  const { result } = renderHook(() => useNotifications(), {
    wrapper: NotificationProvider
  });
  
  act(() => {
    result.current.markAsRead('test-id');
  });
  
  // 상태 변경 확인
});
```

---

## 📋 추후 개선 사항

### 백엔드 통합
- REST API 또는 GraphQL 연동
- 실시간 데이터 업데이트 (WebSocket)
- 인증 시스템 강화

### 기능 확장
- 운전자별 상세 통계
- 경로 최적화 알고리즘
- 푸시 알림 시스템
- 모바일 앱 개발

### 성능 개선
- 코드 스플리팅
- 이미지 최적화
- PWA 적용
- 서버사이드 렌더링

---

## 💡 핵심 설계 원칙

1. **컴포넌트 재사용성**: Map, DriverCard 등 범용적으로 사용 가능
2. **상태 관리 중앙화**: Context API로 전역 상태 관리
3. **타입 안정성**: PropTypes 또는 TypeScript 도입 고려
4. **접근성**: ARIA 속성 및 키보드 네비게이션 지원
5. **반응형 디자인**: 다양한 화면 크기 지원

---

## 🔄 데이터 플로우

```
사용자 액션 → 컴포넌트 이벤트 → Context 업데이트 → 상태 변경 → UI 재렌더링
```

**예시: 알림 읽음 처리**
1. 사용자가 알림 읽음 버튼 클릭
2. NotificationPanel에서 markAsRead 호출
3. NotificationContext에서 상태 업데이트
4. 모든 구독 컴포넌트 자동 재렌더링
5. UI에 변경사항 반영

---

이 문서를 통해 프로젝트의 전체적인 구조와 각 기능의 구현 방식을 이해할 수 있으며, 향후 유지보수나 기능 확장 시 참고 자료로 활용할 수 있습니다.

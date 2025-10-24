# 지도API 명세서

마지막 수정: 2025-10-24

목적
- 운행 모니터링 대시보드에서 Kakao 지도 SDK를 모듈화하여 재사용성과 안정성을 높이고, 메모리 누수 없이 마커/오버레이/폴리라인을 관리하기 위한 설계 명세서.

개요
- Parent: `KakaoMapContainer` — SDK 로드, 지도 인스턴스 생성/초기화, children에게 `map` 인스턴스 주입, 한 번만 로드.
- Child components (map 인스턴스를 prop으로 받음):
  1. `RealtimeMarkers` — 드라이버 아바타(원형 오버레이) + 라벨(노선/운전자명) 표시
  2. `EventMarkers` — 이벤트/이상 발생 지점 마커(아이콘) 표시
  3. `RoutePolyline` — 경로 라인(색상/두께 커스터마이징)

환경 변수
- 필수: `REACT_APP_KAKAO_MAP_API_KEY` (프로젝트 루트 `.env`에 저장)
  - 예: `REACT_APP_KAKAO_MAP_API_KEY=your_kakao_key_here`
  - 주의: create-react-app 환경에서는 `.env`는 프로젝트 루트에 위치해야 하며, 변경 후 개발 서버 재시작 필요.
  - 카카오 개발자 설정에서 허용 도메인(Referer)을 반드시 등록.

Parent: KakaoMapContainer
- 파일: `src/components/Map/KakaoMapContainer.jsx`
- 책임
  - `process.env.REACT_APP_KAKAO_MAP_API_KEY` 확인. 키 누락 시 친절한 UI/콘솔 에러 출력 및 스크립트 삽입 차단.
  - Kakao SDK 스크립트(https://dapi.kakao.com/v2/maps/sdk.js) 한 번만 로드.
  - `map` 인스턴스 생성 및 `children`에 `map` prop 주입(React.cloneElement 사용).
  - 언마운트 시 map 관련 잔여 오브젝트(markers, overlays, polyline 등) 제거.
- Props
  - `children`: React nodes (자식 컴포넌트들에 `map` prop 주입)
  - `width`(string), `height`(string)
  - `center` ({ lat:number, lng:number }) 기본값: 서울 중심
  - `level`(number): 초기 줌 레벨
  - `className`(string)
- 에러 처리
  - API 키 미설정: UI/콘솔 안내
  - SDK 로드 실패: 콘솔 에러

Child: RealtimeMarkers
- 파일: `src/components/Map/RealtimeMarkers.jsx`
- 책임
  - 전달받은 `map` 인스턴스에 CustomOverlay를 생성하여 아바타(이미지 혹은 이니셜)와 라벨(운전자명/노선/차량번호)을 표시.
  - props 변경 시 기존 오버레이를 모두 제거하고 새로 렌더링.
  - 언마운트 시 모든 오버레이 제거하여 메모리 누수 방지.
- Props
  - `map`: Kakao Map 인스턴스 (required)
  - `drivers`: Array of { lat:number, lng:number, avatar?:string, label?:string, color?:string }
- 스타일 가이드
  - 아바타: 40~44px 원형, 흰색 테두리(2~3px), 그림자(soft)
  - 라벨: 반투명 흰 배경, 소형 폰트, 둥근 모서리

Child: EventMarkers
- 파일: `src/components/Map/EventMarkers.jsx`
- 책임
  - 사건/경고의 지점에 마커(이미지 또는 기본 마커) 표시.
  - props 변경/언마운트 시 기존 마커 제거.
- Props
  - `map`: Kakao Map 인스턴스 (required)
  - `events`: Array of { lat:number, lng:number, imageSrc?:string, icon?:string }
- 아이콘
  - 아이콘이 주어지면 MarkerImage로 표시. 없으면 기본 마커 사용.

Child: RoutePolyline
- 파일: `src/components/Map/RoutePolyline.jsx`
- 책임
  - 주어진 경로 좌표 배열로 Polyline을 그린다.
  - path 변경 혹은 언마운트 시 기존 polyline 제거.
  - 그리기 후 bounds를 계산하여 `map.setBounds(bounds)`로 자동 줌/센터 조절(필요시 예외 처리).
- Props
  - `map`: Kakao Map 인스턴스 (required)
  - `path`: Array of { lat:number, lng:number }
  - `color`: string (예: `#3b82f6`)

데이터/형식 규약 (권장)
- 모든 좌표는 숫자형으로 강제: `Number(value)` 를 통해 변환 후 `Number.isFinite()`로 필터링.
- 이벤트 객체 기본 필드: `eventType`, `latitude`, `longitude`, `description`, `eventTimestamp`.
- driving-record로부터 파생된 경로(polygon/polyline)는 후보 키들: `locations`, `route`, `points`, `coordinates`, `path` 등을 확인.

통합 가이드 (페이지별 적용)
- DriveDetail (완료된 배차)
  - `fetchDriveLocations(id)` → `RoutePolyline` 의 `path`에 전달
  - `fetchDriveEvents(id)` → `EventMarkers` 의 `events`에 전달 (이미지/아이콘은 이벤트 타입에 매핑)
  - (선택) 정적 운전자/버스 정보는 `RealtimeMarkers`로 오버레이 표시
- Insight (운행 인사이트 / 실시간)
  - `useInsightData()` 훅의 `markers` (구독된 실시간 위치들)를 `RealtimeMarkers`로 전달하여 실시간 위치/라벨 표시
  - 필요 시 `EventMarkers`로 집계된 이벤트 핀 표시
- RealtimeOperation (단일 배차 실시간)
  - `useLiveDispatch(dispatchId)`의 `latestLocation`을 `RealtimeMarkers`로 표시
  - `fetchEvents(dispatchId)` 결과를 `EventMarkers`로 표시
  - driving-record에 경로가 있을 경우 `RoutePolyline`에 전달

에러 & 엣지케이스
- SDK key 누락 → 실패 UI/콘솔 메시지(개발자 안내)
- Referer 차단(카카오 개발자 설정) → 네트워크 403 또는 SDK 내부 에러
- 좌표가 불완전(문자열/빈값) → 모든 컴포넌트에서 숫자 강제 및 필터링
- 빈 배열(마커/경로 없음) → Map은 기본 중심/레벨로 렌더, 자식 컴포넌트는 아무것도 그리지 않음

테스트 전략
- 단위 테스트(리액트): 각 컴포넌트가 `map` mock을 받아 올바른 Kakao API 호출을 하는지 확인(Mock: `window.kakao.maps.LatLng`, `Marker`, `CustomOverlay`, `Polyline` 등).
- 통합 테스트: Storybook 또는 페이지 수준에서 실제 브라우저(예: Cypress)로 아래 확인
  - SDK 스크립트가 로드되는지
  - `KakaoMapContainer`가 `map`을 생성하고 자식이 렌더되는지
  - 드라이버 리스트/이벤트/경로가 올바르게 표시되는지

성능 및 메모리
- 오버레이/마커/폴리라인은 반드시 언마운트/업데이트 시 제거.
- 많은 마커(수백 이상)인 경우 클러스터링(미구현) 또는 Canvas 기반 렌더링 고려.

마이그레이션 노트 (기존 `Map.jsx` → 모듈형)
- 기존 페이지에서 `KakaoMap`을 사용하던 코드를 아래처럼 점진 대체
  - 기존: `<KakaoMap polyline={...} markers={...} />`
  - 새로운: 
```jsx
<KakaoMapContainer height="340px">
  <RoutePolyline path={path} color="#2563eb" />
  <EventMarkers events={events} />
  <RealtimeMarkers drivers={drivers} />
</KakaoMapContainer>
```
- 변경 시 주의: 기존 `polyline`/`markers`에 포함된 좌표를 숫자형으로 변환하고 null/NaN을 필터링하세요.

운영/배포 체크리스트
- `.env`에 `REACT_APP_KAKAO_MAP_API_KEY`가 기록되어 있고, 배포 환경에서 CI/CD가 해당 env를 주입하는지 확인.
- 카카오 콘솔에서 배포 도메인을 등록 (`https://yourdomain.com` 등).
- CSP(콘텐츠 보안 정책)가 있을 경우 `https://dapi.kakao.com` 도메인 허용.

문의 및 확장 아이디어
- 마커 클러스터링 컴포넌트 추가 (대량 데이터 대응)
- 마커 클릭으로 세부 사이드패널 열기 (상세 로그/비디오 링크)
- 폴리라인 애니메이션 (운전 경로 따라 차량 아이콘 이동)

---
이 명세서는 프로젝트의 지도 관련 변경과 향후 확장을 빠르게 적용하기 위한 가이드입니다. 구현 중 문제가 발생하면 콘솔 로그, 네트워크 요청 결과, 그리고 샘플 API 응답(예: `fetchDriveLocations`/`fetchDriveEvents`)을 제공해주시면 빠르게 도와드리겠습니다.

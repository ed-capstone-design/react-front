import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TokenProvider, useToken } from './components/Token/TokenProvider';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Buses from './pages/Buses';
import OperatingSchedule from './pages/OperatingSchedule';
import Insight from './pages/Insight';
import UserDetailPage from './pages/UserDetailPage';
import DriveDetail from './pages/DriveDetail';
import RealtimeOperation from './pages/RealtimeOperation';
import MyPage from './pages/MyPage';
import Layout from './components/Layout/Layout';
import WsTest from './pages/WsTest';
import ToastProvider from './components/Toast/ToastProvider';
// import { NotificationCountProvider } from './components/Notification/NotificationCountProvider';
import { NotificationProvider } from './components/Notification/contexts/NotificationProvider';
import { checkBackendConnection } from './utils/apiUtils';
import { useEffect, useState } from 'react';
import './App.css';
import { WebSocketProvider } from './components/WebSocket/WebSocketProvider';

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  const { getToken, isAccessTokenValid, clearTokens } = useToken();
  const token = getToken();
  
  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  
  // 토큰이 있지만 만료되었으면 토큰 삭제 후 로그인 페이지로 리다이렉트
  if (!isAccessTokenValid()) {
    console.log('⚠️ 만료된 토큰 감지 - 로그아웃 처리');
    clearTokens();
    return <Navigate to="/signin" replace />;
  }
  
  // 유효한 토큰이 있으면 페이지 접근 허용
  return children;
};

// 루트 경로 리다이렉트 컴포넌트
const RootRedirect = () => {
  const { getToken, isAccessTokenValid, clearTokens } = useToken();
  const token = getToken();
  
  // 토큰이 없으면 로그인 페이지로
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  
  // 토큰이 있지만 만료되었으면 토큰 삭제 후 로그인 페이지로
  if (!isAccessTokenValid()) {
    console.log('⚠️ 루트 접근 시 만료된 토큰 감지 - 로그아웃 처리');
    clearTokens();
    return <Navigate to="/signin" replace />;
  }
  
  // 유효한 토큰이 있으면 홈으로
  return <Navigate to="/home" replace />;
};

// 보안(보호) 구역: 전역 Provider 하에서 보호 라우트만 렌더링
const PrivateShell = () => (
  <Routes>
    <Route path="/home" element={
      <ProtectedRoute>
        <Layout><Home /></Layout>
      </ProtectedRoute>
    } />
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <Layout><Dashboard /></Layout>
      </ProtectedRoute>
    } />
    <Route path="/drivers" element={
      <ProtectedRoute>
        <Layout><Drivers /></Layout>
      </ProtectedRoute>
    } />
    <Route path="/buses" element={
      <ProtectedRoute>
        <Layout><Buses /></Layout>
      </ProtectedRoute>
    } />
    <Route path="/operating-schedule" element={
      <ProtectedRoute>
        <Layout><OperatingSchedule /></Layout>
      </ProtectedRoute>
    } />
    <Route path="/insight" element={
      <ProtectedRoute>
        <Layout><Insight /></Layout>
      </ProtectedRoute>
    } />
    <Route path="/userdetailpage/:id" element={
      <ProtectedRoute>
        <Layout><UserDetailPage /></Layout>
      </ProtectedRoute>
    } />
    <Route path="/drivedetail/:id" element={
      <ProtectedRoute>
        <Layout><DriveDetail /></Layout>
      </ProtectedRoute>
    } />
    <Route path="/realtime-operation/:id" element={
      <ProtectedRoute>
        <Layout><RealtimeOperation /></Layout>
      </ProtectedRoute>
    } />
    <Route path="/mypage" element={
      <ProtectedRoute>
        <Layout><MyPage /></Layout>
      </ProtectedRoute>
    } />
  </Routes>
);

function App() {
  return (
    <TokenProvider>
      <ToastProvider>
        <WebSocketProvider>
          <NotificationProvider>
            <Router>
              <div className="App">
                <Routes>
              {/* 공개(비보호) 경로 */}
                <Route path="/" element={<RootRedirect />} />
                <Route path="/signin" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/ws-test" element={<WsTest />} />
              {/* 기타 모든 경로는 보호 쉘로 라우팅 */}
                <Route path="/*" element={<PrivateShell />} />
              </Routes>
            </div>
            </Router>
          </NotificationProvider>
        </WebSocketProvider>
      </ToastProvider>
    </TokenProvider>
  );
}
export default App;

import { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import ToastProvider from './components/Toast/ToastProvider';
import { NotificationProvider } from './Context/NotificationProvider';
import './App.css';
import { WebSocketProvider } from './Context/WebSocketProvider';
import { AuthGate, PrivateShell } from './RoutesComponents';
import { AuthProvider } from './Context/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function App() {
  const queryClient = useMemo(() => new QueryClient(), []);


  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <div className="App">
              <Routes>
                {/* ✅ 1. 공개 경로: 웹소켓이나 알림 프로바이더를 거치지 않음 */}
                {/* 토큰이 없어도 실행에 아무 지장이 없는 순수 영역입니다. */}
                <Route path="/" element={<AuthGate mode="entry" />} />
                <Route path="/auth" element={<Auth />} />

                {/* ✅ 2. 보호 경로: 로그인 성공 후에만 웹소켓과 알림을 활성화 */}
                {/* PrivateShell 내부에서 AuthGate가 한 번 더 토큰을 검사하므로 안전합니다. */}
                <Route
                  path="/*"
                  element={
                    <WebSocketProvider>
                      <NotificationProvider>
                        <PrivateShell />
                      </NotificationProvider>
                    </WebSocketProvider>
                  }
                />
              </Routes>
            </div>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}
export default App;

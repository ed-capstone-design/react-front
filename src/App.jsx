import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TokenProvider, useToken } from './components/Token/TokenProvider';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Buses from './pages/Buses';
import OperatingSchedule from './pages/OperatingSchedule';
import Insight from './pages/Insight';
import UserDetailPage from './pages/UserDetailPage';
import DriveDetail from './pages/DriveDetail';
import MyPage from './pages/MyPage';
import Layout from './components/Layout/Layout';
import ToastProvider from './components/Toast/ToastProvider';
import { NotificationCountProvider } from './components/Notification/NotificationCountProvider';
import { checkBackendConnection } from './utils/apiUtils';
import { useEffect, useState } from 'react';
import './App.css';
import { WebSocketProvider } from './components/WebSocket/WebSocketProvider';

// // 백엔드 연결 상태 확인 컴포넌트
// const BackendConnectionChecker = ({ children }) => {
//   const [connectionStatus, setConnectionStatus] = useState({
//     checked: false,
//     connected: false,
//     message: ''
//   });

//   useEffect(() => {
//     const checkConnection = async () => {
//       console.log('🔍 백엔드 서버 연결 상태 확인 중...');
//       const result = await checkBackendConnection();
//       setConnectionStatus({
//         checked: true,
//         connected: result.connected,
//         message: result.message
//       });
      
//       if (!result.connected) {
//         console.warn('⚠️ 백엔드 연결 실패:', result.message);
//       } else {
//         console.log('✅ 백엔드 서버 연결 성공');
//       }
//     };

//     checkConnection();
//   }, []);

//   // 연결 상태 확인 중
//   if (!connectionStatus.checked) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">서버 연결 상태 확인 중...</p>
//         </div>
//       </div>
//     );
//   }

//   // 연결 실패시 경고 표시하지만 앱은 계속 동작
//   if (!connectionStatus.connected) {
//     return (
//       <div>
//         <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
//           <div className="flex">
//             <div className="flex-shrink-0">
//               <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//               </svg>
//             </div>
//             <div className="ml-3">
//               <p className="text-sm text-yellow-700">
//                 <strong>백엔드 서버 연결 실패:</strong> {connectionStatus.message}
//               </p>
//               <p className="text-xs text-yellow-600 mt-1">
//                 일부 기능이 제한될 수 있습니다. 개발 서버가 실행 중인지 확인해주세요.
//               </p>
//             </div>
//           </div>
//         </div>
//         {children}
//       </div>
//     );
//   }

//   return children;
// };

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  const { getToken } = useToken();
  const token = getToken();
  // return children;
  return token ? children : <Navigate to="/signin" replace />;
};

// 루트 경로 리다이렉트 컴포넌트
const RootRedirect = () => {
  const { getToken } = useToken();
  const token = getToken();
  return <Navigate to={token ? "/dashboard" : "/signin"} replace />;
    // return <Navigate to={token ? "signin" : "/dashboard"} replace />;
};

function App() {
  return (
     <TokenProvider>
        <ToastProvider>
          <WebSocketProvider>
            <NotificationCountProvider>
              <Router>
                <div className="App">
                  <Routes>
                      <Route path="/" element={<RootRedirect />} />
                      <Route path="/signin" element={<Auth />} />
                      <Route path="/signup" element={<Auth />} />
                      <Route path="/auth" element={<Auth />} />
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
                      <Route path="/mypage" element={
                        <ProtectedRoute>
                          <MyPage />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </div>
                </Router>
              </NotificationCountProvider>
            </WebSocketProvider>
          </ToastProvider>
        </TokenProvider>
  );
}
export default App;

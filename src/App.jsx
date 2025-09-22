import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TokenProvider, useToken } from './components/Token/TokenProvider';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
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
import './App.css';
// import { WebSocketProvider } from './components/WebSocket/WebSocketProvider';

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  const { getToken } = useToken();
  const token = getToken();
  return children;
  // return token ? children : <Navigate to="/signin" replace />;
};

// 루트 경로 리다이렉트 컴포넌트
const RootRedirect = () => {
  const { getToken } = useToken();
  const token = getToken();
  // return <Navigate to={token ? "/dashboard" : "/signin"} replace />;
    return <Navigate to={token ? "signin" : "/dashboard"} replace />;
};

function App() {
  return (
    // <WebSocketProvider>
    // </WebSocketProvider>
     <TokenProvider>
        <ToastProvider>
          <NotificationCountProvider>
            <Router>
              <div className="App">
                <Routes>
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="/signin" element={<Signin />} />
                  <Route path="/signup" element={<Signup />} />
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
        </ToastProvider>
      </TokenProvider>
  );
}
export default App;

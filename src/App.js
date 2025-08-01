import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import OperatingSchedule from './pages/OperatingSchedule';
import Insight from './pages/Insight';
import UserDetailPage from './pages/UserDetailPage';
import DriveDetail from './pages/DriveDetail';
import Layout from './components/Layout/Layout';
import './App.css';

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/signin" replace />;
};

// 루트 경로 리다이렉트 컴포넌트
const RootRedirect = () => {
  const token = localStorage.getItem('token');
  return <Navigate to={token ? "/dashboard" : "/signin"} replace />;
};

function App() {
  return (
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
          <Route path="/userdetailpage" element={
            <ProtectedRoute>
              <Layout><UserDetailPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/drivedetail/:id" element={
            <ProtectedRoute>
              <Layout><DriveDetail /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}
export default App;

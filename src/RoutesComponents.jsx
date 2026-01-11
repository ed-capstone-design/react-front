import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import { useToken } from "./components/Token/TokenProvider";
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

export const AuthGate = ({ mode = "protect", children }) => {
    const { isAccessTokenValid, clearTokens } = useToken();
    const hasValidToken = isAccessTokenValid();

    if (!hasValidToken) {
        if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ 인증 실패 - 로그인 페이지로 리다이렉트');
        }
        clearTokens();
        return <Navigate to="/signin" replace />;
    }
    if (mode === "entry") {
        return <Navigate to="/home" replace />;
    }
    return children;
};


const ProtectedLayout = () => (
    <AuthGate>
        <Layout>
            <Outlet />
        </Layout>
    </AuthGate>
);

export const PrivateShell = () => (
    <Routes>
        <Route element={<ProtectedLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/buses" element={<Buses />} />
            <Route path="/operating-schedule" element={<OperatingSchedule />} />
            <Route path="/insight" element={<Insight />} />
            <Route path="/userdetailpage/:id" element={<UserDetailPage />} />
            <Route path="/drivedetail/:id" element={<DriveDetail />} />
            <Route path="/realtime-operation/:id" element={<RealtimeOperation />} />
            <Route path="/mypage" element={<MyPage />} />
        </Route>
    </Routes>
);


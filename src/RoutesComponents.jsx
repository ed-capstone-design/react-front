import { Navigate, Route, Routes, Outlet } from "react-router-dom";
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
import SkeletonPage from "./pages/SkeletonPage";
import { useAuthContext } from "./Context/AuthProvider";

export const AuthGate = ({ mode = "protect", children }) => {


    const {
        isLoggedIn,
        isLoading,
        isError
    } = useAuthContext();

    if (isLoading) {
        return <SkeletonPage />;
    }
    if (!isLoggedIn) {
        return <Navigate to="/auth" replace />;
    }
    if (mode === "entry") {
        return <Navigate to="/home" replace />;
    }
    return children;
};


const ProtectedLayout = () => (
    < AuthGate >
        <Layout>
            <Outlet />
        </Layout>
    </AuthGate >
);

export const PrivateShell = () => (
    <Routes>
        <Route element={<ProtectedLayout />}>
            <Route path="skeleton" element={<SkeletonPage />} />
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


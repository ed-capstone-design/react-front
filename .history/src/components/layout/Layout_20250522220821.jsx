import React, { useEffect, useState } from 'react';
import './layout.css';
import Sidebar from '../sidebar/Sidebar';
import TopNav from '../topnav/TopNav';
import AppRoutes from '../Routes';
import { useSelector, useDispatch } from 'react-redux';
import ThemeAction from '../../redux/actions/ThemeAction';
import SignIn from '../../pages/signin'; // 로그인 페이지 컴포넌트

const Layout = () => {
    const themeReducer = useSelector((state) => state.ThemeReducer);
    const dispatch = useDispatch();

    // 사이드바 오픈 상태
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const themeClass = localStorage.getItem('themeMode') || 'theme-mode-light';
        const colorClass = localStorage.getItem('colorMode') || 'theme-mode-light';
        dispatch(ThemeAction.setMode(themeClass));
        dispatch(ThemeAction.setColor(colorClass));
    }, [dispatch]);
     const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 로그인 성공 시 호출
    const handleLogin = () => setIsLoggedIn(true);

    if (!isLoggedIn) {
        // 로그인 전에는 로그인 페이지만 보여줌
        return <SignIn onLogin={handleLogin} />;
    }

    return (
        <div className={`layout ${themeReducer.mode} ${themeReducer.color}`}>
            {/* 사이드바에 open, onClose 전달 */}
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="layout__content">
                {/* TopNav에 onSidebarToggle 전달 */}
                <TopNav onSidebarToggle={() => setSidebarOpen(true)} />
                <div className="layout__content-main">
                    <AppRoutes />
                </div>
            </div>
        </div>
    );
};

export default Layout;
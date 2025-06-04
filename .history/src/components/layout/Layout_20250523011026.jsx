import React, { useEffect, useState } from 'react';
import './layout.css';
import Sidebar from '../sidebar/Sidebar';
import TopNav from '../topnav/TopNav';
import AppRoutes from '../Routes';
import { useSelector, useDispatch } from 'react-redux';
import ThemeAction from '../../redux/actions/ThemeAction';
import SignIn from '../../pages/signin'; // 로그인 페이지 컴포넌트

const Layout = () => {

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
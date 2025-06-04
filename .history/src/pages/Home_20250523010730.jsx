import React from "react";
import Sidebar from "../components/sidebar/Sidebar";
const Home = () => {
  return (
          <div>
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

export default Home;
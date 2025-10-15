import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopNav from "../TopNav/TopNav";
import { 
  IoHomeOutline,
  IoSpeedometerOutline,
  IoPeopleOutline,
  IoBusOutline,
  IoCalendarOutline,
  IoAnalyticsOutline
} from "react-icons/io5";

const menu = [
  { name: "홈", key: "home", path: "/", icon: IoHomeOutline },
  { name: "대시보드", key: "dashboard", path: "/dashboard", icon: IoSpeedometerOutline },
  { name: "운전자 관리", key: "drivers", path: "/drivers", icon: IoPeopleOutline },
  { name: "버스 관리", key: "buses", path: "/buses", icon: IoBusOutline },
  { name: "운행 스케줄", key: "operating-schedule", path: "/operating-schedule", icon: IoCalendarOutline },
  { name: "인사이트", key: "insight", path: "/insight", icon: IoAnalyticsOutline },
];

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const routeToKey = useMemo(() => {
    const map = new Map(menu.map(m => [m.path, m.key]));
    return map.get(currentPath) || null;
  }, [currentPath]);

  return (
    <div className="min-h-screen relative flex flex-col bg-white">
      {/* Top Navigation (full width) */}
      <TopNav
        onLogoClick={() => navigate("/home")}
      />

      {/* Below header: left rail + main content */}
      <div className="flex flex-1">
        {/* Left icon rail under the header */}
        <div className="flex flex-col items-center pt-20 w-14 border-r border-gray-200/70 bg-white/70 backdrop-blur sticky top-0 h-screen z-20 shadow-lg">
          <nav className="flex-1 flex flex-col items-center gap-3">
            {menu.map(m => {
              const active = routeToKey === m.key;
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => navigate(m.path)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    active ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                  aria-current={active ? 'page' : undefined}
                  title={m.name}
                  aria-label={m.name}
                >
                  <Icon className="text-xl" />
                </button>
              );
            })}
          </nav>
          <div className="pb-4 text-[10px] text-gray-400">v0.1</div>
        </div>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 max-w-7xl mx-auto py-8 px-4 sm:px-6 w-full">
            <div className="rounded-2xl border border-gray-200/70 bg-white shadow-xl shadow-gray-300/50 p-6 sm:p-8 min-h-[60vh]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;

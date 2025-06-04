import React from "react";
import { Link, useLocation } from "react-router-dom";
import { IoSpeedometerOutline, IoPeopleOutline, IoCalendarOutline, IoBarChartOutline, IoPersonCircleOutline } from "react-icons/io5";

const menu = [
  { id: 1 ,name: "대시보드", path: "/dashboard", icon: <IoSpeedometerOutline /> },
  { name: "운전자 관리", path: "/drivers", icon: <IoPeopleOutline /> },
  { name: "운행 스케줄", path: "/operating-schedule", icon: <IoCalendarOutline /> },
  { name: "인사이트", path: "/insight", icon: <IoBarChartOutline /> },
  { name: "사용자 상세", path: "/userdetailpage", icon: <IoPersonCircleOutline /> },
];

const Sidebar = ({ open, onClose, position = "left", menu, selected, onMenuClick }) => {
  const sideClass =
    position === "right"
      ? "right-0 left-auto"
      : "left-0 right-auto";

  return (
    <aside
      className={`fixed top-0 ${sideClass} h-full bg-gradient-to-b from-blue-700 to-blue-400 shadow-2xl z-30 transition-transform duration-200 ${
        open
          ? "translate-x-0"
          : position === "right"
          ? "translate-x-full"
          : "-translate-x-full"
      } w-64`}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-blue-300">
        <span className="font-bold text-xl text-white tracking-wide">운전의 진수</span>
        <button onClick={onClose} className="text-blue-100 hover:text-white text-2xl font-bold">&times;</button>
      </div>
      <nav className="mt-6">
        <ul>
          {menu.map((item) => (
            <li key={item.key}>
              <button
                className={`flex items-center gap-3 px-6 py-3 my-1 w-full text-left rounded-lg transition-colors
                  ${
                    selected === item.key
                      ? "bg-white text-blue-700 font-semibold shadow"
                      : "text-blue-100 hover:bg-blue-600 hover:text-white"
                  }`}
                onClick={() => onMenuClick(item.key)}
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-full px-6 py-4 text-xs text-blue-100 opacity-70">
        © 2025 운전의 진수
      </div>
    </aside>
  );
};

export default Sidebar;
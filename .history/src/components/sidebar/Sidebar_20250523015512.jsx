import React from "react";
import { Link, useLocation } from "react-router-dom";

const menu = [
  { name: "대시보드", path: "/dashboard" },
  { name: "운전자 관리", path: "/drivers" },
  { name: "운행 스케줄", path: "/operating-schedule" },
  { name: "인사이트", path: "/insight" },
  { name: "사용자 상세", path: "/userdetailpage" },
];

const Sidebar = ({ open, onClose, position = "left" }) => {
  const location = useLocation();
  const sideClass =
    position === "right"
      ? "right-0 left-auto"
      : "left-0 right-auto";

  return (
    <aside
      className={`fixed top-0 ${sideClass} h-full bg-white shadow-lg z-20 transition-transform duration-200 ${
        open
          ? "translate-x-0"
          : position === "right"
          ? "translate-x-full"
          : "-translate-x-full"
      } w-64`}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <span className="font-bold text-lg">메뉴</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">&times;</button>
      </div>
      <nav className="mt-4">
        <ul>
          {menu.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block px-6 py-3 hover:bg-blue-100 ${
                  location.pathname === item.path ? "bg-blue-200 font-semibold" : ""
                }`}
                onClick={onClose}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
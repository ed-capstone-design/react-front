import React from "react";

import { IoMenu } from "react-icons/io5";

const Sidebar = ({ menu = [], open, onClose, position = "right", selected, onMenuClick }) => {
  const sideClass =
    position === "right"
      ? "right-0 left-auto"
      : "left-0 right-auto";

  return (
    <aside
      className={`fixed top-0 ${sideClass} h-full bg-white shadow-lg z-50 transition-transform duration-200 ${
        open
          ? "translate-x-0"
          : position === "right"
          ? "translate-x-full"
          : "-translate-x-full"
      } w-64 border-r border-gray-100`}
    >
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
        <button onClick={onClose} aria-label="사이드바 닫기" className="p-1 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <IoMenu className="text-2xl text-gray-700" />
        </button>
        <button
          className="flex items-center gap-2"
          onClick={() => {
            if (typeof onMenuClick === 'function') onMenuClick({ path: '/dashboard' });
            if (typeof onClose === 'function') onClose();
          }}
          aria-label="대시보드로 이동"
        >
          <img
            src={`${process.env.PUBLIC_URL}/logo.svg`}
            alt="운전의 진수"
            className="h-7 w-7 object-contain"
            onError={(e) => {
              const current = e.currentTarget.getAttribute('src') || '';
              if (current.includes('logo.svg')) {
                e.currentTarget.src = `${process.env.PUBLIC_URL}/logo192.png`;
              } else if (current.includes('logo192.png')) {
                e.currentTarget.src = `${process.env.PUBLIC_URL}/logo512.png`;
              }
            }}
          />
          <span className="font-bold text-lg text-blue-600 tracking-wide select-none">운전의 진수</span>
        </button>
      </div>
      <nav className="mt-6">
        <ul>
          {menu.map((item) => (
            <li key={item.key}>
              <button
                className={`flex items-center gap-3 px-6 py-3 my-1 w-full text-left rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  selected === item.key
                    ? "bg-blue-50 text-blue-600 font-semibold ring-1 ring-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => onMenuClick(item)}
                aria-current={selected === item.key ? 'page' : undefined}
              >
                {typeof item.icon === 'function' ? (
                  <item.icon className="text-xl" />
                ) : (
                  <span className="text-xl">{item.icon}</span>
                )}
                <span className="text-sm">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-full px-6 py-4 text-xs text-gray-300">
        © 2025 운전의 진수
      </div>
    </aside>
  );
};

export default Sidebar;
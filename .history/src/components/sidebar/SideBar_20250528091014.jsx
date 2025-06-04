import React from "react";

const Sidebar = ({ menu = [], open, onClose, position = "right", selected, onMenuClick }) => {
  const sideClass =
    position === "right"
      ? "right-0 left-auto"
      : "left-0 right-auto";

  return (
    <aside
      className={`fixed top-0 ${sideClass} h-full bg-sky-50 shadow z-30 transition-transform duration-200 ${
        open
          ? "translate-x-0"
          : position === "right"
          ? "translate-x-full"
          : "-translate-x-full"
      } w-64`}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-sky-100">
        <span className="font-bold text-xl text-sky-700 tracking-wide">운전의 진수</span>
        <button onClick={onClose} className="text-sky-300 hover:text-sky-600 text-2xl font-bold">&times;</button>
      </div>
      <nav className="mt-6">
        <ul>
          {menu.map((item) => (
            <li key={item.key}>
              <button
                className={`flex items-center gap-3 px-6 py-3 my-1 w-full text-left rounded-md transition-colors
                  ${
                    selected === item.key
                      ? "bg-white text-sky-700 font-semibold shadow-sm"
                      : "text-sky-700 hover:bg-sky-100 hover:text-sky-900"
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
      <div className="absolute bottom-0 w-full px-6 py-4 text-xs text-sky-300 opacity-80">
        © 2025 운전의 진수
      </div>
    </aside>
  );
};

export default Sidebar;
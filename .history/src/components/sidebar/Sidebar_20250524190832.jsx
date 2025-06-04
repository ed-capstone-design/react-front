import React from "react";


const Sidebar = ({ menu = [], open, onClose, position = "right", selected, onMenuClick }) => {
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
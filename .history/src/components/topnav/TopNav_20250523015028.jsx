import { FaHome, FaSignOutAlt, IoMenu } from "react-icons/fa"; // react-icons에서 아이콘 import

const TopNav = () => (
  <nav className="w-full bg-blue-600 py-4 px-8 flex justify-between items-center shadow">
    <div className="text-white text-2xl font-bold">운전의 진수</div>
    <div className="space-x-6 flex items-center">
      <button className="text-white hover:underline flex items-center gap-2">
        <FaHome />
        Home
      </button>
      <button className="text-white hover:underline flex items-center gap-2">
        <FaSignOutAlt />
        로그아웃
      </button>
      <IoMenu />
    </div>
  </nav>
);

export default TopNav;
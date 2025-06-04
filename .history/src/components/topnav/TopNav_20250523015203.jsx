import { IoHome, IoLogOut, IoMenu } from "react-icons/io5"; // io5 아이콘으로 통일

const TopNav = () => (
  <nav className="w-full bg-blue-600 py-4 px-8 flex justify-between items-center shadow">
    <div className="text-white text-2xl font-bold">운전의 진수</div>
    <div className="space-x-6 flex items-center">
      <button className="text-white hover:underline flex items-center gap-2">
        <IoHome />
        Home
      </button>
      <button className="text-white hover:underline flex items-center gap-2">
        <IoLogOut />
        로그아웃
      </button>
      <IoMenu className="text-white text-2xl cursor-pointer" />
    </div>
  </nav>
);

export default TopNav;
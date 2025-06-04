const TopNav = () => (
  <nav className="w-full bg-skybloog-600 py-4 px-8 flex justify-between items-center shadow">
    <div className="text-white text-2xl font-bold">My Dashboard</div>
    <div className="space-x-6">
      <button className="text-white hover:underline">홈</button>
      <button className="text-white hover:underline">통계</button>
      <button className="text-white hover:underline">설정</button>
      <button className="text-white hover:underline">로그아웃</button>
    </div>
  </nav>
);export default TopNav;
import React from "react";
import TopNav from "../components/TopNav/TopNav";
import InfoCard from "../components/Card/IndoCard";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-5xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold mb-6">대시보드</h2>
        <div className="flex gap-6 mb-8 flex-wrap">
          <InfoCard title="오늘 방문자" value="1,234명" desc="실시간" />
          <InfoCard title="총 회원수" value="567명" desc="누적" />
          <InfoCard title="신규 가입" value="12명" desc="오늘" />
        </div>
        <div className="bg-white rounded shadow p-6">
         여기기
        </div>
      </div>
    </div>
  );
};

export default Home;
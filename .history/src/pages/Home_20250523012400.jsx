import React from "react";
import TopNav from "../components/TopNav/TopNav";
import
// 상단 네비게이션 컴포넌트 예시


// 정보 카드 예시 컴포넌트
const InfoCard = ({ title, value, desc }) => (
  <div className="bg-white rounded shadow p-6 flex-1 min-w-[200px]">
    <div className="text-gray-500 text-sm mb-1">{desc}</div>
    <div className="text-2xl font-bold mb-2">{value}</div>
    <div className="text-blue-700 font-semibold">{title}</div>
  </div>
);

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
          <h3 className="text-xl font-bold mb-4">공지사항</h3>
          <ul className="list-disc pl-6 text-gray-700">
            <li>서비스 점검 안내 (5/30 02:00~04:00)</li>
            <li>신규 기능 업데이트 예정</li>
            <li>문의사항은 support@example.com으로 연락주세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
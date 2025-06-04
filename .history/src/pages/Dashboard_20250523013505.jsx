import React from "react";

const Dashboard = () => {
  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">대시보드</h2>
      {/* 상태 카드(통계) 예시 */}
      <div className="flex gap-6 mb-8 flex-wrap">
        <div className="bg-white rounded shadow p-6 flex-1 min-w-[200px]">
          <div className="text-gray-500 text-sm mb-1">실시간</div>
          <div className="text-2xl font-bold mb-2">1,234명</div>
          <div className="text-blue-700 font-semibold">오늘 방문자</div>
        </div>
        <div className="bg-white rounded shadow p-6 flex-1 min-w-[200px]">
          <div className="text-gray-500 text-sm mb-1">누적</div>
          <div className="text-2xl font-bold mb-2">567명</div>
          <div className="text-blue-700 font-semibold">총 회원수</div>
        </div>
        <div className="bg-white rounded shadow p-6 flex-1 min-w-[200px]">
          <div className="text-gray-500 text-sm mb-1">오늘</div>
          <div className="text-2xl font-bold mb-2">12명</div>
          <div className="text-blue-700 font-semibold">신규 가입</div>
        </div>
      </div>
      {/* 운행 만족도/점수 차트 (예시) */}
      <div className="bg-white rounded shadow p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">운행 만족도/점수 차트</h3>
        <div className="h-40 flex items-center justify-center text-gray-400">[차트 영역]</div>
      </div>
      {/* 운행 현황 테이블 */}
      <div className="bg-white rounded shadow p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">운행 현황</h3>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2">노선</th>
              <th className="py-2">출발 시간</th>
              <th className="py-2">상태</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>101번</td>
              <td>08:00</td>
              <td>운행중</td>
            </tr>
            <tr>
              <td>202번</td>
              <td>09:00</td>
              <td>대기</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* 이달의 우수 기사님 테이블 */}
      <div className="bg-white rounded shadow p-6">
        <h3 className="text-xl font-bold mb-4">이달의 우수 기사님</h3>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2">이름</th>
              <th className="py-2">노선</th>
              <th className="py-2">점수</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>홍길동</td>
              <td>101번</td>
              <td>98점</td>
            </tr>
            <tr>
              <td>김철수</td>
              <td>202번</td>
              <td>95점</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
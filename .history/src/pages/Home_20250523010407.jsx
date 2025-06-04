import React from "react";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <h1 className="text-4xl font-bold mb-4 text-blue-700">홈페이지</h1>
      <p className="text-lg text-gray-700 mb-8">환영합니다! 이곳은 웹페이지 홈입니다.</p>
      <div className="bg-white p-6 rounded shadow-md">
        <ul className="space-y-2">
          <li className="text-blue-600">로그인 및 회원가입 기능</li>
          <li className="text-blue-600">TailwindCSS 적용</li>
          <li className="text-blue-600">React Router로 페이지 이동</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
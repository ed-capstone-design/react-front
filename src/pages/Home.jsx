import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IoSpeedometerOutline,
  IoPeopleOutline,
  IoBusOutline,
  IoCalendarOutline,
  IoAnalyticsOutline,
  IoArrowForwardOutline
} from 'react-icons/io5';

const Home = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: '대시보드',
      description: '종합 운행 데이터',
      icon: IoSpeedometerOutline,
      path: '/dashboard',
      color: 'blue',
      bgGradient: 'from-blue-600 to-blue-700'
    },
    {
      title: '운전자 관리',
      description: '운전자 통합관리',
      icon: IoPeopleOutline,
      path: '/drivers',
      color: 'blue',
      bgGradient: 'from-sky-500 to-sky-600'
    },
    {
      title: '운행 스케줄',
      description: '운행 스케줄 종합관리',
      icon: IoCalendarOutline,
      path: '/operating-schedule',
      color: 'blue',
      bgGradient: 'from-cyan-500 to-cyan-600'
    },
    {
      title: '버스 관리',
      description: '차량 정보 및 상태 관리',
      icon: IoBusOutline,
      path: '/buses',
      color: 'blue',
      bgGradient: 'from-indigo-500 to-indigo-600'
    },
    {
      title: '인사이트',
      description: '실시간 운행 데이터 확인 및 관제',
      icon: IoAnalyticsOutline,
      path: '/insight',
      color: 'blue',
      bgGradient: 'from-slate-500 to-slate-600'
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 메인 컨테이너 */}
      <div className="container mx-auto px-6 py-12">
        {/* 헤더 섹션 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-lg mb-6">
            <span className="text-2xl font-bold text-white">운진</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
            운전의 진수
          </h1>
          <p className="text-xl text-gray-600 font-medium max-w-md mx-auto">
            차세대 스마트 관제시스템의 효율적인 운행관리
          </p>
        </div>

        {/* 메뉴 카드 그리드 - 가로 배치 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              onClick={() => handleCardClick(item.path)}
              className="group relative bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* 카드 내용 */}
              <div className="p-4">
                {/* 아이콘 */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${item.bgGradient} shadow-md mb-3`}>
                  <Icon className="text-lg text-white" />
                </div>
                
                {/* 제목 */}
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors leading-tight">
                  {item.title}
                </h3>
                
                {/* 설명 */}
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors leading-relaxed mb-3">
                  {item.description}
                </p>

                {/* 이동 버튼 */}
                <div className="flex items-center justify-end text-gray-400 group-hover:text-blue-600 transition-colors">
                  <IoArrowForwardOutline className="text-base transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* 호버 효과 테두리 */}
              <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-blue-200 transition-colors duration-300" />
            </div>
          );
        })}
        </div>

        {/* 하단 정보 섹션 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-white/50 shadow-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">시스템 연결상태 양호 </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
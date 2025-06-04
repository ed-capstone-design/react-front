import React from "react";
import { IoBus, IoPersonCircle, IoWarning, IoSpeedometer, IoLocation, IoArrowBack } from "react-icons/io5";

const dummyOBD = {
  speed: 52,
  rpm: 2100,
  temp: 87,
  fuel: 65,
  error: false,
};

const dummyDriver = {
  name: "홍길동",
  phone: "010-1234-5678",
  license: "1종 보통",
};

const dummyBus = {
  number: "서울 12가 3456",
  route: "101번",
  status: "운행중",
};

const dummyAlerts = [
  { time: "14:22:10", type: "급가속", desc: "급가속 감지" },
  { time: "14:24:03", type: "엔진오류", desc: "엔진 이상 감지" },
];

const dummyLocation = {
  lat: 37.5665,
  lng: 126.9780,
  desc: "서울시청 앞",
};

const DriveDetail = ({ id, onBackToInsight }) => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={onBackToInsight}
        className="mb-4 flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <IoArrowBack className="text-lg" />
        <span className="font-medium">인사이트로 돌아가기</span>
      </button>
      
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <IoBus className="text-blue-600" /> 운행 상세 정보
      </h2>
      {/* 운전자/버스 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <IoPersonCircle className="text-4xl text-blue-500" />
          <div>
            <div className="font-bold text-blue-700">{dummyDriver.name}</div>
            <div className="text-gray-500 text-sm">{dummyDriver.phone}</div>
            <div className="text-gray-400 text-xs">면허: {dummyDriver.license}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <IoBus className="text-4xl text-blue-500" />
          <div>
            <div className="font-bold text-blue-700">{dummyBus.number}</div>
            <div className="text-gray-500 text-sm">노선: {dummyBus.route}</div>
            <div className="text-green-600 text-xs font-bold">{dummyBus.status}</div>
          </div>
        </div>
      </div>
      {/* OBD 정보 */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <IoSpeedometer className="text-blue-600 text-2xl" />
          <span className="font-bold text-blue-700">실시간 OBD 정보</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-gray-500 text-sm">속도</div>
            <div className="text-xl font-bold">{dummyOBD.speed} km/h</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">RPM</div>
            <div className="text-xl font-bold">{dummyOBD.rpm} rpm</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">냉각수 온도</div>
            <div className="text-xl font-bold">{dummyOBD.temp} ℃</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">연료</div>
            <div className="text-xl font-bold">{dummyOBD.fuel} %</div>
          </div>
        </div>
      </div>
      {/* 이상감지 정보 */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <IoWarning className="text-red-500 text-2xl" />
          <span className="font-bold text-red-600">이상 감지 정보</span>
        </div>
        {dummyAlerts.length === 0 ? (
          <div className="text-gray-400">이상 없음</div>
        ) : (
          <ul className="space-y-2">
            {dummyAlerts.map((alert, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{alert.time}</span>
                <span className="font-semibold text-red-500">{alert.type}</span>
                <span className="text-gray-700">{alert.desc}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* 실시간 위치 */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <IoLocation className="text-blue-600 text-2xl" />
          <span className="font-bold text-blue-700">실시간 위치</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center text-blue-400 text-5xl">
            <IoBus />
          </div>
          <div>
            <div className="font-bold text-blue-700">{dummyLocation.desc}</div>
            <div className="text-gray-500 text-sm">
              위도: {dummyLocation.lat} / 경도: {dummyLocation.lng}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriveDetail;
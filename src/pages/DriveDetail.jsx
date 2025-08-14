import React, { useState, useEffect } from "react";
import { IoBus, IoPersonCircle, IoWarning, IoSpeedometer, IoLocation, IoArrowBack } from "react-icons/io5";
import KakaoMap from "../components/Map/Map";
import axios from "axios";

const DriveDetail = ({ id, onBackToInsight }) => {
  const [driveData, setDriveData] = useState(null);
  const [obdData, setObdData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetchDriveDetail();
    // 실시간 업데이트를 위한 인터벌 설정 (10초마다)
    const interval = setInterval(fetchDriveDetail, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchDriveDetail = async () => {
    try {
      // 배차 정보와 드라이버, 버스 정보 가져오기
      const dispatchResponse = await axios.get(`/api/dispatch/${id}`);
      const driverResponse = await axios.get(`/api/drivers/${dispatchResponse.data.driverId}`);
      const busResponse = await axios.get(`/api/buses/${dispatchResponse.data.busId}`);
      
      // 경고 정보 가져오기
      const warningsResponse = await axios.get(`/api/warnings`, {
        params: { dispatchId: id }
      });

      // OBD 정보 가져오기
      let currentOBD = null;
      try {
        const obdResponse = await axios.get(`/api/obd/current/${dispatchResponse.data.busId}`);
        currentOBD = obdResponse.data;
      } catch (obdError) {
        console.warn("OBD 데이터를 가져올 수 없습니다:", obdError.message);
        // 기본값으로 설정
        currentOBD = {
          speed: 0,
          rpm: 0,
          temperature: 0,
          fuelLevel: 0,
          location: { latitude: 37.5665, longitude: 126.9780 }
        };
      }

      setDriveData({
        dispatch: dispatchResponse.data,
        driver: driverResponse.data,
        bus: busResponse.data
      });
      setObdData(currentOBD);
      setAlerts(warningsResponse.data || []);
      setError(null);
    } catch (err) {
      console.error("운행 상세 정보 로딩 실패:", err);
      setError("데이터를 불러올 수 없습니다.");
      // 에러 시 더미 데이터로 대체
      setDriveData({
        dispatch: { dispatchId: id, status: "RUNNING", dispatchDate: new Date().toISOString().split('T')[0] },
        driver: { name: "홍길동", phoneNumber: "010-1234-5678", licenseType: "1종 보통" },
        bus: { plateNumber: "서울 12가 3456", busNumber: "101", status: "ACTIVE" }
      });
      setObdData({
        speed: 52,
        rpm: 2100,
        temperature: 87,
        fuelLevel: 65,
        location: { latitude: 37.5665, longitude: 126.9780 }
      });
      setAlerts([
        { warningTime: new Date().toISOString(), warningType: "SUDDEN_ACCELERATION", description: "급가속 감지" },
        { warningTime: new Date().toISOString(), warningType: "ENGINE_ERROR", description: "엔진 이상 감지" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">운행 상세 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!driveData) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">운행 정보를 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }
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
            <div className="font-bold text-blue-700">{driveData.driver.name}</div>
            <div className="text-gray-500 text-sm">{driveData.driver.phoneNumber}</div>
            <div className="text-gray-400 text-xs">면허: {driveData.driver.licenseType}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <IoBus className="text-4xl text-blue-500" />
          <div>
            <div className="font-bold text-blue-700">{driveData.bus.plateNumber}</div>
            <div className="text-gray-500 text-sm">노선: {driveData.bus.busNumber}번</div>
            <div className={`text-xs font-bold ${
              driveData.dispatch.status === "RUNNING" ? "text-green-600" :
              driveData.dispatch.status === "COMPLETED" ? "text-blue-600" :
              driveData.dispatch.status === "DELAYED" ? "text-orange-600" :
              "text-gray-600"
            }`}>
              {driveData.dispatch.status === "RUNNING" ? "운행중" :
               driveData.dispatch.status === "COMPLETED" ? "완료" :
               driveData.dispatch.status === "DELAYED" ? "지연" : "대기"}
            </div>
          </div>
        </div>
      </div>
      {/* OBD 정보 */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <IoSpeedometer className="text-blue-600 text-2xl" />
          <span className="font-bold text-blue-700">실시간 OBD 정보</span>
          {error && (
            <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">
              데모 데이터
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-gray-500 text-sm">속도</div>
            <div className="text-xl font-bold">{obdData?.speed || 0} km/h</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">RPM</div>
            <div className="text-xl font-bold">{obdData?.rpm || 0} rpm</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">냉각수 온도</div>
            <div className="text-xl font-bold">{obdData?.temperature || 0} ℃</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">연료</div>
            <div className="text-xl font-bold">{obdData?.fuelLevel || 0} %</div>
          </div>
        </div>
      </div>
      {/* 이상감지 정보 */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <IoWarning className="text-red-500 text-2xl" />
          <span className="font-bold text-red-600">이상 감지 정보</span>
        </div>
        {alerts.length === 0 ? (
          <div className="text-gray-400">이상 없음</div>
        ) : (
          <ul className="space-y-2">
            {alerts.map((alert, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  {new Date(alert.warningTime).toLocaleTimeString('ko-KR')}
                </span>
                <span className="font-semibold text-red-500">
                  {alert.warningType === "SUDDEN_ACCELERATION" ? "급가속" :
                   alert.warningType === "SUDDEN_BRAKING" ? "급제동" :
                   alert.warningType === "SPEEDING" ? "과속" :
                   alert.warningType === "ENGINE_ERROR" ? "엔진오류" :
                   alert.warningType}
                </span>
                <span className="text-gray-700">{alert.description}</span>
              </li>
            ))}
          </ul>
        )}
      </div>      {/* 실시간 위치 */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <IoLocation className="text-blue-600 text-2xl" />
          <span className="font-bold text-blue-700">실시간 위치</span>
        </div>
        
        {/* 위치 정보 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center text-blue-400 text-5xl">
            <IoBus />
          </div>
          <div>
            <div className="font-bold text-blue-700">
              {obdData?.location?.address || "위치 정보 없음"}
            </div>
            <div className="text-gray-500 text-sm">
              위도: {obdData?.location?.latitude || 37.5665} / 
              경도: {obdData?.location?.longitude || 126.9780}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
            </div>
          </div>
        </div>

        {/* 지도 */}
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <KakaoMap 
            markers={[
              {
                lat: obdData?.location?.latitude || 37.5665,
                lng: obdData?.location?.longitude || 126.9780,
                imageSrc: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png"
              }
            ]} 
            width="100%" 
            height="400px" 
          />
        </div>
      </div>
    </div>
  );
};

export default DriveDetail;
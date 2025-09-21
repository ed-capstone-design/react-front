import React, { useState, useEffect } from "react";
import { useBus } from "./BusContext";

const BusDetailModal = ({ isOpen, onClose, bus, mode = 'view' }) => {
  const { addBus, updateBus } = useBus();
  const [formData, setFormData] = useState({
    routeNumber: '',
    routeType: 'CITY',
    capacity: '',
    vehicleNumber: '',
    vehicleType: 'STANDARD',
    vehicleYear: '',
    lastMaintenance: '',
    repairCount: 0,
    operatorId: 1,
    fuelType: 'DIESEL'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && bus && mode !== 'create') {
      setFormData({
        routeNumber: bus.routeNumber || '',
        routeType: bus.routeType || 'CITY',
        capacity: bus.capacity || '',
        vehicleNumber: bus.vehicleNumber || '',
        vehicleType: bus.vehicleType || 'STANDARD',
        vehicleYear: bus.vehicleYear || '',
        lastMaintenance: bus.lastMaintenance || '',
        repairCount: bus.repairCount || 0,
        operatorId: bus.operatorId || 1,
        fuelType: bus.fuelType || 'DIESEL'
      });
    } else if (mode === 'create') {
      setFormData({
        routeNumber: '',
        routeType: 'CITY',
        capacity: '',
        vehicleNumber: '',
        vehicleType: 'STANDARD',
        vehicleYear: '',
        lastMaintenance: '',
        repairCount: 0,
        operatorId: 1,
        fuelType: 'DIESEL'
      });
    }
  }, [isOpen, bus, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (mode === 'create') {
        result = await addBus(formData);
      } else {
        result = await updateBus(bus.busId, formData);
      }

      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('버스 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? '버스 추가' : mode === 'edit' ? '버스 수정' : '버스 상세정보';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">노선번호 *</label>
              <input
                type="text"
                name="routeNumber"
                value={formData.routeNumber}
                onChange={handleChange}
                required
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">노선유형 *</label>
              <select
                name="routeType"
                value={formData.routeType}
                onChange={handleChange}
                required
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="CITY">시내</option>
                <option value="TOWN">마을버스</option>
                <option value="EXPRESS">고속</option>
                <option value="INTERCITY">시외고속</option>
                <option value="COMMUTER">광역버스</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">차량번호 *</label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                required
                disabled={isReadOnly || mode === 'edit'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">차량유형 *</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
                disabled={isReadOnly || mode === 'edit'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="MINI">소형</option>
                <option value="STANDARD">일반</option>
                <option value="DOUBLE">2층</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">좌석수 *</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                min="1"
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">차량연식 *</label>
              <input
                type="number"
                name="vehicleYear"
                value={formData.vehicleYear}
                onChange={handleChange}
                required
                min="1990"
                max={new Date().getFullYear() + 1}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">연료유형 *</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                required
                disabled={isReadOnly || mode === 'edit'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="DIESEL">경유</option>
                <option value="LPG">LPG</option>
                <option value="ELECTRIC">전기</option>
                <option value="HYBRID">하이브리드</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">최근 정비일</label>
              <input
                type="date"
                name="lastMaintenance"
                value={formData.lastMaintenance}
                onChange={handleChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">정비횟수</label>
              <input
                type="number"
                name="repairCount"
                value={formData.repairCount}
                onChange={handleChange}
                min="0"
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              취소
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusDetailModal;

import React from "react";

const BusCard = ({ bus, onEdit, onDelete, onSelect, isSelected }) => {
  const getRouteTypeLabel = (type) => {
    const labels = {
      'CITY': '시내',
      'SUBURBAN': '시외',
      'EXPRESS': '고속',
      'INTERCITY': '시외고속'
    };
    return labels[type] || type;
  };

  const getVehicleTypeLabel = (type) => {
    const labels = {
      'MINI': '소형',
      'STANDARD': '일반',
      'DOUBLE': '2층'
    };
    return labels[type] || type;
  };

  const getFuelTypeLabel = (type) => {
    const labels = {
      'DIESEL': '경유',
      'LPG': 'LPG',
      'ELECTRIC': '전기',
      'HYBRID': '하이브리드'
    };
    return labels[type] || type;
  };

  const getMaintenanceStatus = (lastMaintenance) => {
    if (!lastMaintenance) return { status: 'warning', text: '미점검' };
    
    const lastDate = new Date(lastMaintenance);
    const today = new Date();
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 365) return { status: 'danger', text: '점검필요' };
    if (diffDays > 300) return { status: 'warning', text: '점검예정' };
    return { status: 'good', text: '정상' };
  };

  const maintenanceStatus = getMaintenanceStatus(bus.lastMaintenance);
  const vehicleAge = new Date().getFullYear() - bus.vehicleYear;

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-200'
      }`}
      onClick={() => onSelect && onSelect(bus)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {bus.routeNumber}번
          </h3>
          <p className="text-sm text-gray-600">{bus.vehicleNumber}</p>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bus);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              수정
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(bus);
              }}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">노선유형</p>
          <p className="text-sm font-medium">{getRouteTypeLabel(bus.routeType)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">차량유형</p>
          <p className="text-sm font-medium">{getVehicleTypeLabel(bus.vehicleType)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">좌석수</p>
          <p className="text-sm font-medium">{bus.capacity}석</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">연료</p>
          <p className="text-sm font-medium">{getFuelTypeLabel(bus.fuelType)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          차령: {vehicleAge}년 | 정비: {bus.repairCount}회
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          maintenanceStatus.status === 'good' ? 'bg-green-100 text-green-800' :
          maintenanceStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {maintenanceStatus.text}
        </div>
      </div>
    </div>
  );
};

export default BusCard;

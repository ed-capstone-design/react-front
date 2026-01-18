const BusCard = ({ bus, onEdit, onDelete, onSelect, isSelected }) => {
  const getRouteTypeLabel = (type) => {
    const labels = {
      'CITY': '시내',
      'COMMUTER': '광역',
      'TOWN': '마을버스',
      'EXPRESS': '고속버스',
      'INTERCITY': '시외버스'
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
      className={`bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition cursor-pointer border ${isSelected ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-100 hover:border-blue-200'
        }`}
      onClick={() => onSelect && onSelect(bus)}
    >
      {/* 상단 라벨/버튼 */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold rounded px-2 py-1 mr-1 tracking-wide">
            {bus.routeNumber}번
          </span>
          <span className="text-xs text-gray-400 font-mono">{bus.vehicleNumber}</span>
        </div>
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={e => { e.stopPropagation(); onEdit(bus); }}
              className="px-2 py-1 text-xs text-blue-500 hover:text-white hover:bg-blue-500 rounded transition"
              title="수정"
            >수정</button>
          )}
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(bus); }}
              className="px-2 py-1 text-xs text-red-500 hover:text-white hover:bg-red-500 rounded transition"
              title="삭제"
            >삭제</button>
          )}
        </div>
      </div>

      {/* 주요 정보 한 줄 */}
      <div className="flex flex-wrap gap-2 mb-3 text-sm">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-gray-700 border border-gray-100">
          <span className="font-semibold">{getRouteTypeLabel(bus.routeType)}</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-gray-700 border border-gray-100">
          <span className="font-semibold">{getVehicleTypeLabel(bus.vehicleType)}</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-gray-700 border border-gray-100">
          <span className="font-semibold">{bus.capacity}석</span>
        </span>
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-100 my-3" />

      {/* 하단 정보 */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          차령 <span className="font-semibold text-gray-700">{vehicleAge}년</span> · 정비 <span className="font-semibold text-gray-700">{bus.repairCount}회</span>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${maintenanceStatus.status === 'good' ? 'bg-green-100 text-green-700' :
          maintenanceStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
          {maintenanceStatus.text}
        </div>
      </div>
    </div>
  );
};

export default BusCard;

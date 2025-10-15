import React, { useState, useEffect } from "react";
import { useBusAPI } from "../../hooks/useBusAPI";
import BusCard from "./BusCard";
import BusDetailModal from "./BusDetailModal";
import { useToast } from "../Toast/ToastProvider";

const BusListPanel = () => {
  const { buses, loading, error, deleteBus, getBusStats, fetchBuses } = useBusAPI();
  const toast = useToast();
  const [selectedBus, setSelectedBus] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'routeNumber', 'vehicleNumber'

  // 컴포넌트 마운트 시 버스 목록 로드
  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const stats = getBusStats();

  const filteredBuses = buses.filter(bus => {
    if (!searchTerm) return true;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (searchType === 'routeNumber') {
      return bus.routeNumber.toLowerCase().includes(lowerSearchTerm);
    } else if (searchType === 'vehicleNumber') {
      return bus.vehicleNumber.toLowerCase().includes(lowerSearchTerm);
    } else {
      // searchType === 'all'
      return bus.routeNumber.toLowerCase().includes(lowerSearchTerm) ||
             bus.vehicleNumber.toLowerCase().includes(lowerSearchTerm);
    }
  });

  const handleCardClick = (bus) => {
    setSelectedBus(bus);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (bus) => {
    setSelectedBus(bus);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (bus) => {
    if (window.confirm(`${bus.routeNumber}번 버스를 삭제하시겠습니까?`)) {
      const result = await deleteBus(bus.busId);
      if (result.success) {
        toast.success(`${bus.routeNumber}번 버스가 성공적으로 삭제되었습니다.`);
        // 목록 새로고침
        fetchBuses();
      } else {
        toast.error(result.error || '버스 삭제에 실패했습니다.');
      }
    }
  };

  const handleCreate = () => {
    setSelectedBus(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBus(null);
  };

  const handleModalSuccess = () => {
    closeModal();
    // 목록 새로고침
    fetchBuses();
  };

  if (loading && buses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">버스 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">버스 관리</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            버스 추가
          </button>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">전체 버스</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}대</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">평균 차령</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.avgAge}년</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">시내버스</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.byRouteType.CITY || 0}대</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">친환경차량</h3>
            <p className="text-2xl font-bold text-green-600">
              {(stats.byFuelType.ELECTRIC || 0) + (stats.byFuelType.HYBRID || 0)}대
            </p>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-1 gap-2">
            <input
              type="text"
              placeholder={
                searchType === 'routeNumber' ? "노선번호로 검색..." :
                searchType === 'vehicleNumber' ? "차량번호로 검색..." :
                "노선번호 또는 차량번호로 검색..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="routeNumber">노선번호</option>
              <option value="vehicleNumber">차량번호</option>
            </select>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* 버스 목록 */}
      {filteredBuses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchTerm ? '검색 결과가 없습니다.' : '등록된 버스가 없습니다.'}
          </div>
          {!searchTerm && (
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              첫 번째 버스 추가하기
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuses.map((bus) => (
            <BusCard
              key={bus.busId}
              bus={bus}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={handleCardClick}
            />
          ))}
        </div>
      )}

      {/* 모달 */}
      <BusDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        bus={selectedBus}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default BusListPanel;

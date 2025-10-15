import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDriverAPI } from "../../hooks/useDriverAPI";
import DriverCard from "./DriverCard";
import EditDriverModal from "./EditDriverModal";
import { useToast } from "../Toast/ToastProvider";

const DriverListPanel = () => {
  const navigate = useNavigate();
  const { drivers, loading, error, deleteDriver, fetchDrivers } = useDriverAPI();
  const toast = useToast();
  
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'username', 'licenseNumber', 'grade'
  const [gradeFilter, setGradeFilter] = useState('all'); // 'all', 'A', 'B', 'C', 'D', 'F'

  // 컴포넌트 마운트 시 운전자 목록 로드
  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // 통계 계산
  const getDriverStats = () => {
    if (!drivers.length) return { total: 0, gradeA: 0, gradeB: 0, gradeC: 0, avgScore: 0 };
    
    const gradeA = drivers.filter(d => d.grade === 'A').length;
    const gradeB = drivers.filter(d => d.grade === 'B').length;
    const gradeC = drivers.filter(d => d.grade === 'C').length;
    const totalScore = drivers.reduce((sum, d) => sum + (parseFloat(d.avgDrivingScore) || 0), 0);
    const avgScore = drivers.length > 0 ? (totalScore / drivers.length).toFixed(1) : 0;
    
    return {
      total: drivers.length,
      gradeA,
      gradeB,
      gradeC,
      avgScore
    };
  };

  const stats = getDriverStats();

  // 검색 및 필터링
  const filteredDrivers = drivers.filter(driver => {
    // 등급 필터
    if (gradeFilter !== 'all' && driver.grade !== gradeFilter) {
      return false;
    }
    
    // 검색어 필터
    if (!searchTerm) return true;
    
    switch (searchType) {
      case 'username':
        return driver.username?.toLowerCase().includes(searchTerm.toLowerCase());
      case 'licenseNumber':
        return driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      case 'grade':
        return driver.grade?.toLowerCase().includes(searchTerm.toLowerCase());
      default:
        return (
          driver.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.grade?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
  });

  const handleView = (driver) => {
    navigate(`/userdetailpage/${driver.userId}`);
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (driver) => {
    if (window.confirm(`${driver.username} 운전자를 삭제하시겠습니까?`)) {
      const result = await deleteDriver(driver.userId);
      if (result.success) {
        toast.success(`${driver.username} 운전자가 성공적으로 삭제되었습니다.`);
        fetchDrivers();
      } else {
        toast.error(result.error || '운전자 삭제에 실패했습니다.');
      }
    }
  };

  const handleCreate = () => {
    setSelectedDriver(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDriver(null);
  };

  const handleModalSuccess = () => {
    closeModal();
    fetchDrivers();
  };

  if (loading && drivers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">운전자 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* 헤더 및 통계 */}
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 text-left">운전자 관리</h1>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-600">총 운전자</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}명</div>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <div className="text-sm font-medium text-green-600">A등급</div>
            <div className="text-2xl font-bold text-green-700">{stats.gradeA}명</div>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="text-sm font-medium text-blue-600">B등급</div>
            <div className="text-2xl font-bold text-blue-700">{stats.gradeB}명</div>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <div className="text-sm font-medium text-yellow-600">C등급</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.gradeC}명</div>
          </div>
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
            <div className="text-sm font-medium text-purple-600">평균 점수</div>
            <div className="text-2xl font-bold text-purple-700">{stats.avgScore}점</div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">검색 유형</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="username">이름</option>
              <option value="licenseNumber">면허번호</option>
              <option value="grade">등급</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">검색어</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">등급 필터</label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 등급</option>
              <option value="A">A등급</option>
              <option value="B">B등급</option>
              <option value="C">C등급</option>
              <option value="D">D등급</option>
              <option value="F">F등급</option>
            </select>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">오류: {error}</p>
        </div>
      )}

      {/* 운전자 카드 그리드 */}
      {filteredDrivers.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">운전자가 없습니다</div>
          <div className="text-gray-500 text-sm">
            {searchTerm || gradeFilter !== 'all' 
              ? '검색 조건을 변경하거나 새 운전자를 추가해보세요.' 
              : '첫 번째 운전자를 추가해보세요.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDrivers.map((driver) => (
            <DriverCard
              key={driver.userId}
              driver={driver}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* 결과 수 표시 */}
      {filteredDrivers.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          총 {filteredDrivers.length}명의 운전자가 있습니다
          {(searchTerm || gradeFilter !== 'all') && 
            ` (전체 ${drivers.length}명 중)`
          }
        </div>
      )}

      {/* 모달 */}
      <EditDriverModal
        open={isModalOpen}
        onClose={closeModal}
        driver={selectedDriver}
        mode={modalMode}
        onUpdateSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default DriverListPanel;
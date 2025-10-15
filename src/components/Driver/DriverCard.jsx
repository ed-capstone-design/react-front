import React from 'react';
import { 
  IoPersonOutline, 
  IoCarSportOutline, 
  IoStarOutline, 
  IoTimeOutline,
  IoEyeOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoCallOutline
} from 'react-icons/io5';

const DriverCard = ({ driver, onView, onEdit, onDelete }) => {
  const getGradeColor = (grade) => {
    const normalizedGrade = String(grade || '').toUpperCase();
    switch (normalizedGrade) {
      case 'A': return 'bg-green-100 text-green-700 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'F': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };



  return (
    <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition cursor-pointer border border-gray-100 hover:border-blue-200">
      {/* 상단 이름/등급 */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <IoPersonOutline className="text-blue-600 text-sm" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 truncate" title={driver.username}>
              {driver.username || '이름 없음'}
            </h3>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onView && onView(driver); }}
            className="px-2 py-1 text-xs text-blue-500 hover:text-white hover:bg-blue-500 rounded transition"
            title="상세보기"
          >
            상세
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit && onEdit(driver); }}
            className="px-2 py-1 text-xs text-green-500 hover:text-white hover:bg-green-500 rounded transition"
            title="수정"
          >
            수정
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete && onDelete(driver); }}
            className="px-2 py-1 text-xs text-red-500 hover:text-white hover:bg-red-500 rounded transition"
            title="삭제"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 주요 정보 배지들 */}
      <div className="flex flex-wrap gap-2 mb-3 text-sm">
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getGradeColor(driver.grade)}`}>
          {driver.grade || 'C'}급
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-gray-700 border border-gray-100 text-xs">
          <IoTimeOutline />
          <span className="font-semibold">{Math.max(0, parseInt(driver.careerYears) || 0)}년</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-gray-700 border border-gray-100 text-xs">
          <IoStarOutline />
          <span className="font-semibold">{Math.max(0, parseFloat(driver.avgDrivingScore) || 100).toFixed(0)}점</span>
        </span>
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-100 my-3" />

      {/* 하단 정보 */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center px-2 py-1 bg-blue-50 rounded text-blue-700 border border-blue-100 font-medium">
          tel : {driver.phoneNumber || '전화번호 없음'}
        </span>
        <span className="inline-flex items-center px-2 py-1 bg-purple-50 rounded text-purple-700 border border-purple-100 font-medium">
          면허 :{driver.licenseNumber || 'N/A'}
        </span>
      </div>
    </div>
  );
};

export default DriverCard;
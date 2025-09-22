// DriverListPanel.jsx
import React, { useState, useEffect } from 'react';
import { useDriverAPI } from '../../hooks/useDriverAPI';
import DriverCard from './DriverCard';
import DriverDetailModal from './DriverDetailModal';
import UserDetailModal from '../UserDetailModal';

const DriverListPanel = ({ onDriverClick }) => {
    const { drivers, updateDriver, deleteDriver, fetchDrivers } = useDriverAPI();
    const [detailOpen, setDetailOpen] = useState(false);
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);

    // 컴포넌트 마운트 시 운전자 목록 로드
    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);

    // 상태별로 필터링 (영문 ENUM)
    // status: 'DRIVING', 'BREAK', 'OFF'
    const statusLabel = {
        DRIVING: "운행중"
    };
    const 운행중 = drivers.filter((d) => d.status === "DRIVING");

    // 운전자 수정
    const handleUpdate = async (driver) => {
        await updateDriver(driver);
        setDetailOpen(false);
    };
    // 운전자 삭제
    const handleDelete = async (id) => {
        await deleteDriver(id);
        setDetailOpen(false);
    };
    // 카드 클릭 시 메시지 보내기 모달
    const handleCardClick = (driver) => {
        setSelectedDriver(driver);
        setUserModalOpen(true);
    };

    // 운전자 이름 클릭 시 운전 상세 페이지로 이동 (기존 기능 유지)
    const handleNameClick = (driver) => {
        if (onDriverClick) {
            onDriverClick(driver.driverId);
        }
    };

    return(
        <div className="h-[600px] overflow-y-auto pr-1 group relative custom-scrollbar">
            {/* 운행중 */}
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-blue-700">{statusLabel.DRIVING}</span>
            </div>
            {운행중.length === 0 ? <div className="text-xs text-gray-400 mb-2">{statusLabel.DRIVING}인 운전자가 없습니다.</div> :
                운행중.map((driver) => (
                    <div key={driver.driverId} onClick={() => handleCardClick(driver)} className="cursor-pointer">
                        <DriverCard driver={driver} onNameClick={handleNameClick} />
                    </div>
                ))}
            <hr className="my-2"/>
            <DriverDetailModal open={detailOpen} driver={selectedDriver} onClose={() => setDetailOpen(false)} onUpdate={handleUpdate} onDelete={handleDelete} />
            <UserDetailModal open={userModalOpen} user={selectedDriver} onClose={() => setUserModalOpen(false)} />
        </div>
    )
};
export default DriverListPanel;
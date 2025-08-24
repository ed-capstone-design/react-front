// DriverListPanel.jsx
import React, { useContext, useState } from 'react';
import { DriverContext } from './DriverContext';
import DriverCard from './DriverCard';
import DriverDetailModal from './DriverDetailModal';
import UserDetailModal from '../UserDetailModal';

const DriverListPanel = ({ onDriverClick }) => {
    const { drivers, updateDriver, deleteDriver } = useContext(DriverContext);
    const [detailOpen, setDetailOpen] = useState(false);
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);

    // 상태별로 필터링
    const 운행중 = drivers.filter((d) => d.status === "운행중");
    const 대기 = drivers.filter((d) => d.status === "대기");
    const 휴식 = drivers.filter((d) => d.status === "휴식");

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
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold">운행중</span>
            </div>
            {운행중.map((driver) => <div key={driver.driverId} onClick={() => handleCardClick(driver)} className="cursor-pointer"><DriverCard driver={driver} onNameClick={handleNameClick} /></div>)}
            
            <hr className="my-2"/>
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold">대기</span>
            </div>
            {대기.map((driver) => <div key={driver.driverId} onClick={() => handleCardClick(driver)} className="cursor-pointer"><DriverCard driver={driver} onNameClick={handleNameClick} /></div>)}
            
            <hr className="my-2"/>
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold">휴식</span>
            </div>
            {휴식.map((driver) => <div key={driver.driverId} onClick={() => handleCardClick(driver)} className="cursor-pointer"><DriverCard driver={driver} onNameClick={handleNameClick} /></div>)}
            
            <DriverDetailModal open={detailOpen} driver={selectedDriver} onClose={() => setDetailOpen(false)} onUpdate={handleUpdate} onDelete={handleDelete} />
            <UserDetailModal open={userModalOpen} user={selectedDriver} onClose={() => setUserModalOpen(false)} />
        </div>
    )
};
export default DriverListPanel;
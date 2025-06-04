// DriverListPanel.jsx
import React, { useContext, useState } from 'react';
import { DriverContext } from './DriverContext';
import DriverCard from './DriverCard';
import DriverDetailModal from './DriverDetailModal';
import UserDetailModal from '../UserDetailModal';

const DriverListPanel = ({ onDriverClick }) => {
    const { drivers, setDrivers } = useContext(DriverContext);
    const [detailOpen, setDetailOpen] = useState(false);
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);

    // 상태별로 필터링
    const 운행중 = drivers.filter((d) => d.status === "운행중");
    const 대기 = drivers.filter((d) => d.status === "대기");
    const 휴식 = drivers.filter((d) => d.status === "휴식");

    // 운전자 수정
    const handleUpdate = (driver) => {
        setDrivers(prev => prev.map(d => d.id === driver.id ? { ...driver, updated_at: new Date().toISOString() } : d));
    };
    // 운전자 삭제
    const handleDelete = (id) => {
        setDrivers(prev => prev.filter(d => d.id !== id));
    };    // 카드 클릭 시 메시지 보내기 모달
    const handleCardClick = (driver) => {
        setSelectedDriver(driver);
        setUserModalOpen(true);
    };

    // 운전자 이름 클릭 시 운전 상세 페이지로 이동 (기존 기능 유지)
    const handleNameClick = (driver) => {
        if (onDriverClick) {
            onDriverClick(driver.id);
        }
    };

    return(
        <div className="h-[600px] overflow-y-auto pr-1 group relative custom-scrollbar">
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold">운행중</span>
                {/* 운전자 추가 버튼 삭제: 인사이트 패널에서 제거 */}
            </div>            {운행중.map((driver) => <div key={driver.id} className="cursor-pointer"><DriverCard driver={driver} onNameClick={handleCardClick} /></div>)}
            <hr className="my-2"/>
            {대기.map((driver) => <div key={driver.id} className="cursor-pointer"><DriverCard driver={driver} onNameClick={handleCardClick} /></div>)}
            {/* 휴식 상태도 필요시 추가 */}
            {/* <AddDriverModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} /> */}
            <DriverDetailModal open={detailOpen} driver={selectedDriver} onClose={() => setDetailOpen(false)} onUpdate={handleUpdate} onDelete={handleDelete} />
        </div>
    )
};
export default DriverListPanel;

/* custom-scrollbar 클래스를 사용하여 마우스 오버 시에만 스크롤바가 보이도록 커스텀 CSS 필요 */

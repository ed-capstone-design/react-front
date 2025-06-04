// DriverListPanel.jsx
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DriverContext } from './DriverContext';
import DriverCard from './DriverCard';
import DriverDetailModal from './DriverDetailModal';

const DriverListPanel = () => {
    const { drivers, setDrivers } = useContext(DriverContext);
    const navigate = useNavigate();
    const [detailOpen, setDetailOpen] = useState(false);
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
    };    // 카드 클릭 시 운전 상세 페이지로 이동
    const handleCardClick = (driver) => {
        navigate(`/drivedetail/${driver.id}`);
    };

    return(
        <div className="h-[600px] overflow-y-auto pr-1 group relative custom-scrollbar">
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold">운행중</span>
                {/* 운전자 추가 버튼 삭제: 인사이트 패널에서 제거 */}
            </div>
            {운행중.map((driver) => <div key={driver.id} onClick={() => handleCardClick(driver)} className="cursor-pointer"><DriverCard driver={driver} /></div>)}
            <hr className="my-2"/>
            {대기.map((driver) => <div key={driver.id} onClick={() => handleCardClick(driver)} className="cursor-pointer"><DriverCard driver={driver} /></div>)}
            {/* 휴식 상태도 필요시 추가 */}
            {/* <AddDriverModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} /> */}
            <DriverDetailModal open={detailOpen} driver={selectedDriver} onClose={() => setDetailOpen(false)} onUpdate={handleUpdate} onDelete={handleDelete} />
        </div>
    )
};
export default DriverListPanel;

/* custom-scrollbar 클래스를 사용하여 마우스 오버 시에만 스크롤바가 보이도록 커스텀 CSS 필요 */

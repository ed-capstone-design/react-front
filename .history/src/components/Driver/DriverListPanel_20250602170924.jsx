// DriverListPanel.jsx
import React, { useContext, useState } from 'react';
import { DriverContext } from './DriverContext';

const DriverListPanel = () => {
    const { drivers, setDrivers } = useContext(DriverContext);
    const [addOpen, setAddOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);

    // 상태별로 필터링
    const 운행중 = drivers.filter((d) => d.status === "운행중");
    const 대기 = drivers.filter((d) => d.status === "대기");
    const 휴식 = drivers.filter((d) => d.status === "휴식");

    // 운전자 추가
    const handleAdd = (driver) => {
        setDrivers(prev => [
            ...prev,
            { ...driver, id: Date.now(), user_id: Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ]);
    };
    // 운전자 수정
    const handleUpdate = (driver) => {
        setDrivers(prev => prev.map(d => d.id === driver.id ? { ...driver, updated_at: new Date().toISOString() } : d));
    };
    // 운전자 삭제
    const handleDelete = (id) => {
        setDrivers(prev => prev.filter(d => d.id !== id));
    };

    return(
        <div className="h-[600px] overflow-y-auto pr-1 group relative custom-scrollbar">
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold">운행중</span>
                <button onClick={() => setAddOpen(true)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">+ 운전자 추가</button>
            </div>
            {운행중.map((driver) => (
                <div key={driver.id} className="flex justify-between items-center border-b py-2">
                    <div>
                        <div className="font-semibold">{driver.name}</div>
                        <div className="text-xs text-gray-500">{driver.carNumber}</div>
                    </div>
                    <div className="text-xs">
                        <span className={`px-2 py-1 rounded-full ${driver.status === '운행중' ? 'bg-green-100 text-green-800' : driver.status === '대기' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {driver.status}
                        </span>
                    </div>
                </div>
            ))}
            <hr className="my-2"/>
            {대기.map((driver) => (
                <div key={driver.id} className="flex justify-between items-center border-b py-2">
                    <div>
                        <div className="font-semibold">{driver.name}</div>
                        <div className="text-xs text-gray-500">{driver.carNumber}</div>
                    </div>
                    <div className="text-xs">
                        <span className={`px-2 py-1 rounded-full ${driver.status === '운행중' ? 'bg-green-100 text-green-800' : driver.status === '대기' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {driver.status}
                        </span>
                    </div>
                </div>
            ))}
            {/* 휴식 상태도 필요시 추가 */}
        </div>
    )
};
export default DriverListPanel;

/* custom-scrollbar 클래스를 사용하여 마우스 오버 시에만 스크롤바가 보이도록 커스텀 CSS 필요 */

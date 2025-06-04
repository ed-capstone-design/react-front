// DriverListPanel.jsx
import React, { useContext } from 'react';
import { DriverContext } from './DriverContext';
import DriverCard from './DriverCard';



const DriverListPanel = () => {
    const { drivers } = useContext(DriverContext);
    // 상태별로 필터링
    const 운행중 = drivers.filter((d) => d.status === "운행중");
    const 대기 = drivers.filter((d) => d.status === "대기");
    const 휴식 = drivers.filter((d) => d.status === "휴식");
    return(
        <div className="h-[600px] overflow-y-auto pr-1 group relative custom-scrollbar">
            <div className="mb-2 font-bold">운행중</div>
            {운행중.map((driver) => <DriverCard key={driver.id} driver={driver} />)}
            <hr/>
            {대기.map((driver) => <DriverCard key={driver.id} driver={driver} />)}
            {/* 휴식 상태도 필요시 추가 */}
        </div>
    )
};
export default DriverListPanel;

/* custom-scrollbar 클래스를 사용하여 마우스 오버 시에만 스크롤바가 보이도록 커스텀 CSS 필요 */

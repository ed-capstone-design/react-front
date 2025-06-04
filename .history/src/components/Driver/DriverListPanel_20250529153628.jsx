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
        <div className="max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-all duration-200 pr-1 group relative">
            <div className="mb-2 font-bold">운행중</div>
            {운행중.map((driver) => <DriverCard key={driver.id} driver={driver} /><br></br>)}
            <hr/>
            {대기.map((driver) => <DriverCard key={driver.id} driver={driver} />)}
            {/* 휴식 상태도 필요시 추가 */}
        </div>
    )
};
export default DriverListPanel;

/* TailwindCSS 커스텀 스크롤바: 
   - group, hover:scrollbar-thumb-gray-400 등으로 마우스 오버 시만 스크롤바 색상 진하게
   - max-h로 패널 최대 높이 제한 */

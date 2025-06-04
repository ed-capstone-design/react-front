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
        <div>
            <div className="mb-2 font-bold">운행중</div>
            {운행중.map((driver) => <DriverCard key={driver.id} driver={driver} />)}
            <div className="mb-2 font-bold mt-4">대기</div>
            <hr     />
            {대기.map((driver) => <DriverCard key={driver.id} driver={driver} />)}
            <div className="mb-2 font-bold mt-4">휴식</div>
            {휴식.map((driver) => <DriverCard key={driver.id} driver={driver} />)}
        </div>
    )
};
export default DriverListPanel;

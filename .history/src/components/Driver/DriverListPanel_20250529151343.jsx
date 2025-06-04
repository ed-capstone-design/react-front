// DriverListPanel.jsx
import React, { useContext } from 'react';
import { DriverContext } from './DriverContext';
import DriverCard from './DriverCard';



const DriverListPanel = () => {
    const { drivers } = useContext(DriverContext);
    // 배열 생성 및 context에서 받아온 drivers를 배열에 넣기
    const driverArray = [...drivers];
    return(
        <div>
            <span>
                {JSON.stringify(driverArray, null, 2)}
            </span>
        </div>
    )
};
export default DriverListPanel;

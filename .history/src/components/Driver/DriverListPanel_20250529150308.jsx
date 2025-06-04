// DriverListPanel.jsx
import React, { useContext } from 'react';
import { DriverContext } from './DriverContext';
import DriverCard from './DriverCard';



const DriverListPanel = () => {
    return(
        <div>
            <span>
                {DriverContext}
            </span>
        </div>
    )
};
export default DriverListPanel;

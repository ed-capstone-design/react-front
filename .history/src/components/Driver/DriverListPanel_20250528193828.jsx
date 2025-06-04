// components/DriverPanel.js
import React, { useContext } from 'react';
import { DriverContext } from './DriverContext';
import DriverList from './';

export default function DriverPanel() {
  const { drivers } = useContext(DriverContext);

  return (
    <div style={{ padding: '20px' }}>
      <h2>드라이버 패널</h2>
      <DriverList drivers={drivers} />
    </div>
  );
}

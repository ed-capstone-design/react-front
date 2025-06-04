import React, { useContext } from 'react';
import { DriverContext } from '../contexts/DriverContext';
import DriverCard from './DriverCard';

export default function DriverPanel() {
  const { drivers } = useContext(DriverContext);

  return (
    <div style={{ padding: '20px' }}>
      <h2>드라이버 패널</h2>
      {drivers.map((driver) => (
        <DriverCard key={driver.id} driver={driver} />
      ))}
    </div>
  );
}
// components/DriverList.js
import React from 'react';
import DriverCard from './DriverCard';

export default function DriverList({ drivers }) {
  return (
    <div>
      {drivers.map((driver) => (
        <DriverCard key={driver.id} driver={driver} />
      ))}
    </div>
  );
}

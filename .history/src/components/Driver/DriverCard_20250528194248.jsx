import React from 'react';

export default function DriverCard({ driver }) {
  return (
    <div>
      <p><strong>이름:</strong> {driver.name}</p>
      <p><strong>전화번호:</strong> {driver.phone}</p>
      <p><strong>면허번호:</strong> {driver.license_no}</p>
      <p><strong>입사일:</strong> {driver.hire_date}</p>
      <p><strong>상태:</strong> {driver.status}</p>
      <p><strong>주소:</strong> {driver.address}</p>
    </div>
  );
}
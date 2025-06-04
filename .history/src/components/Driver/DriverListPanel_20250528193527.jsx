import React, { useContext } from "react";
import { DriverContext } from "./DriverContext";
import DriverList from "./DriverList";

const a =     [{
    id: 3,
    user_id: 3,
    name: "이영희",
    phone: "010-5555-1234",
    license_no: "77-1234567",
    hire_date: "2020-11-10",
    status: "휴식",
    address: "부산광역시 해운대구 센텀중앙로 3",
    created_at: "2020-11-10T09:00:00",
    updated_at: "2022-12-01T09:00:00"
  }]

const DriverListPanel = () => {

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
      <div className="text-xl font-bold mb-4">운전자 목록</div>
      <DriverList drivers={a} />
    </div>
  );
};

export default DriverListPanel;

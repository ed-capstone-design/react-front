import React, { useState, createContext } from "react";

const DriverContext = createContext();
DriverContext.displayName
const exampleDrivers = [
  {
    id: 1,
    user_id: 1,
    name: "홍길동",
    phone: "010-1234-5678",
    license_no: "12-3456789",
    hire_date: "2022-03-01",
    status: "운행중",
    address: "서울특별시 강남구 테헤란로 1",
    created_at: "2022-03-01T09:00:00",
    updated_at: "2023-05-01T10:00:00"
  },
  {
    id: 2,
    user_id: 2,
    name: "김철수",
    phone: "010-9876-5432",
    license_no: "98-7654321",
    hire_date: "2021-07-15",
    status: "대기",
    address: "경기도 수원시 영통구 대학로 2",
    created_at: "2021-07-15T09:00:00",
    updated_at: "2023-04-20T11:00:00"
  },
  {
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
  }
];

export const DriverProvider = ({ children }) => {
  const [drivers, setDrivers] = useState(exampleDrivers);
  return (
    <DriverContext.Provider value={{ drivers, setDrivers }}>
      {children}
    </DriverContext.Provider>
  );
};
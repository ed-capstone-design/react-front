import React, { useState, createContext } from "react";

export const exampleDrivers = [
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
  },
  {
    id: 4,
    user_id: 4,
    name: "박민수",
    phone: "010-2222-3333",
    license_no: "34-5678901",
    hire_date: "2023-01-10",
    status: "운행중",
    address: "서울특별시 송파구 올림픽로 4",
    created_at: "2023-01-10T09:00:00",
    updated_at: "2023-05-10T10:00:00"
  },
  {
    id: 5,
    user_id: 5,
    name: "최지우",
    phone: "010-3333-4444",
    license_no: "56-7890123",
    hire_date: "2022-05-20",
    status: "대기",
    address: "경기도 고양시 일산동구 중앙로 5",
    created_at: "2022-05-20T09:00:00",
    updated_at: "2023-04-15T11:00:00"
  },
  {
    id: 6,
    user_id: 6,
    name: "한가인",
    phone: "010-4444-5555",
    license_no: "78-9012345",
    hire_date: "2021-09-30",
    status: "휴식",
    address: "대전광역시 유성구 대학로 6",
    created_at: "2021-09-30T09:00:00",
    updated_at: "2022-12-10T09:00:00"
  },
  {
    id: 7,
    user_id: 7,
    name: "정우성",
    phone: "010-5555-6666",
    license_no: "90-1234567",
    hire_date: "2020-12-12",
    status: "운행중",
    address: "광주광역시 북구 하서로 7",
    created_at: "2020-12-12T09:00:00",
    updated_at: "2023-05-01T10:00:00"
  },
  {
    id: 8,
    user_id: 8,
    name: "이수민",
    phone: "010-6666-7777",
    license_no: "23-4567890",
    hire_date: "2022-08-18",
    status: "대기",
    address: "울산광역시 남구 삼산로 8",
    created_at: "2022-08-18T09:00:00",
    updated_at: "2023-04-20T11:00:00"
  },
  {
    id: 9,
    user_id: 9,
    name: "김하늘",
    phone: "010-7777-8888",
    license_no: "45-6789012",
    hire_date: "2021-03-22",
    status: "휴식",
    address: "경상남도 창원시 의창구 중앙대로 9",
    created_at: "2021-03-22T09:00:00",
    updated_at: "2022-12-01T09:00:00"
  },
  {
    id: 10,
    user_id: 10,
    name: "오세훈",
    phone: "010-8888-9999",
    license_no: "67-8901234",
    hire_date: "2023-02-14",
    status: "운행중",
    address: "인천광역시 연수구 송도과학로 10",
    created_at: "2023-02-14T09:00:00",
    updated_at: "2023-05-10T10:00:00"
  },
  {
    id: 11,
    user_id: 11,
    name: "장동건",
    phone: "010-9999-0000",
    license_no: "89-0123456",
    hire_date: "2022-06-25",
    status: "대기",
    address: "경기도 성남시 분당구 판교로 11",
    created_at: "2022-06-25T09:00:00",
    updated_at: "2023-04-15T11:00:00"
  },
  {
    id: 12,
    user_id: 12,
    name: "신민아",
    phone: "010-0000-1111",
    license_no: "01-2345678",
    hire_date: "2021-10-05",
    status: "휴식",
    address: "강원도 춘천시 중앙로 12",
    created_at: "2021-10-05T09:00:00",
    updated_at: "2022-12-10T09:00:00"
  },
  {
    id: 13,
    user_id: 13,
    name: "이준기",
    phone: "010-1111-2222",
    license_no: "13-3456789",
    hire_date: "2020-07-19",
    status: "운행중",
    address: "충청북도 청주시 상당구 상당로 13",
    created_at: "2020-07-19T09:00:00",
    updated_at: "2023-05-01T10:00:00"
  },
  {
    id: 14,
    user_id: 14,
    name: "고소영",
    phone: "010-2222-3333",
    license_no: "25-4567890",
    hire_date: "2022-09-09",
    status: "대기",
    address: "전라북도 전주시 완산구 전주천동로 14",
    created_at: "2022-09-09T09:00:00",
    updated_at: "2023-04-20T11:00:00"
  },
  {
    id: 15,
    user_id: 15,
    name: "박보검",
    phone: "010-3333-4444",
    license_no: "37-5678901",
    hire_date: "2021-12-01",
    status: "휴식",
    address: "경상북도 포항시 남구 포스코대로 15",
    created_at: "2021-12-01T09:00:00",
    updated_at: "2022-12-01T09:00:00"
  },
  {
    id: 16,
    user_id: 16,
    name: "김태희",
    phone: "010-4444-5555",
    license_no: "49-6789012",
    hire_date: "2023-03-03",
    status: "운행중",
    address: "제주특별자치도 제주시 첨단로 16",
    created_at: "2023-03-03T09:00:00",
    updated_at: "2023-05-10T10:00:00"
  },
  {
    id: 17,
    user_id: 17,
    name: "이병헌",
    phone: "010-5555-6666",
    license_no: "61-7890123",
    hire_date: "2022-01-17",
    status: "대기",
    address: "경기도 평택시 평택로 17",
    created_at: "2022-01-17T09:00:00",
    updated_at: "2023-04-15T11:00:00"
  },
  {
    id: 18,
    user_id: 18,
    name: "수지",
    phone: "010-6666-7777",
    license_no: "73-8901234",
    hire_date: "2021-05-28",
    status: "휴식",
    address: "경상남도 진주시 진주대로 18",
    created_at: "2021-05-28T09:00:00",
    updated_at: "2022-12-10T09:00:00"
  },
  {
    id: 19,
    user_id: 19,
    name: "박서준",
    phone: "010-7777-8888",
    license_no: "85-9012345",
    hire_date: "2020-10-23",
    status: "운행중",
    address: "충청남도 천안시 서북구 천안대로 19",
    created_at: "2020-10-23T09:00:00",
    updated_at: "2023-05-01T10:00:00"
  },
  {
    id: 20,
    user_id: 20,
    name: "손예진",
    phone: "010-8888-9999",
    license_no: "97-0123456",
    hire_date: "2022-11-11",
    status: "대기",
    address: "서울특별시 마포구 월드컵북로 20",
    created_at: "2022-11-11T09:00:00",
    updated_at: "2023-04-20T11:00:00"
  }
];

const DriverContext = createContext();
DriverContext.displayName = "DriverContext";

export { DriverContext };
export const DriverProvider = ({ children }) => {
  const [drivers, setDrivers] = useState(exampleDrivers);
  return (
    <DriverContext.Provider value={{ drivers, setDrivers }}>
      {children}
    </DriverContext.Provider>
  );
};
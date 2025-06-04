import React, { useState } from "react";
import UserDetailModal from "../components/UserDetailModal";

const drivers = [
  { name: "홍길동", phone: "010-1234-5678", route: "101번", email: "hong@example.com", status: "활성", joinDate: "2024-01-01" },
  { name: "김철수", phone: "010-9876-5432", route: "202번", email: "kim@example.com", status: "비활성", joinDate: "2024-02-01" },
];

const Drivers = ({ onEditUserDetail }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">운전자 관리</h2>
      <table className="w-full bg-white rounded-lg shadow-sm text-left border border-gray-100">
        <thead>
          <tr>
            <th className="py-3 px-4 text-gray-600">이름</th>
            <th className="py-3 px-4 text-gray-600">연락처</th>
            <th className="py-3 px-4 text-gray-600">노선</th>
            <th className="py-3 px-4 text-gray-600">상태</th>
            <th className="py-3 px-4 text-gray-600">상세</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d, idx) => (
            <tr key={idx} className="hover:bg-blue-50 transition">
              <td className="py-3 px-4">{d.name}</td>
              <td className="py-3 px-4">{d.phone}</td>
              <td className="py-3 px-4">{d.route}</td>
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm
                  ${d.status === "활성" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {d.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <button
                  className="text-blue-600 hover:underline font-semibold"
                  onClick={() => {
                    setSelectedDriver(d);
                    setModalOpen(true);
                  }}
                >
                  상세보기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <UserDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedDriver}
        onEdit={() => {
          setModalOpen(false);
          onEditUserDetail && onEditUserDetail();
        }}
      />
    </div>
  );
};

export default Drivers;
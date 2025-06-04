import React, { useState } from "react";
import UserDetailModal from "../components/UserDetailModal";
import { Link } from "react-router-dom"; // 라우터를 쓰지 않더라도 구조상 import, 실제로는 콜백 사용

const initialDrivers = [
  { name: "홍길동", phone: "010-1234-5678", route: "101번", email: "hong@example.com", status: "활성", joinDate: "2024-01-01" },
  { name: "김철수", phone: "010-9876-5432", route: "202번", email: "kim@example.com", status: "비활성", joinDate: "2024-02-01" },
];

const Drivers = ({ onUserNameClick, onEditUserDetail }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [addOpen, setAddOpen] = useState(false);

  // 운전자 추가
  const handleAdd = (driver) => {
    setDrivers(prev => [
      ...prev,
      { ...driver, status: "활성", joinDate: new Date().toISOString().slice(0, 10) }
    ]);
  };

  // 운전자 수정
  const handleEdit = (driver) => {
    setDrivers(prev => prev.map(d => d.email === driver.email ? driver : d));
  };

  // 운전자 삭제
  const handleDelete = (email) => {
    setDrivers(prev => prev.filter(d => d.email !== email));
    setModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">운전자 관리</h2>
      <div className="flex justify-end mb-2">
        <button onClick={() => setAddOpen(true)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">+ 운전자 추가</button>
      </div>
      <table className="w-full bg-white border border-gray-100 rounded-lg shadow-sm text-left">
        <thead>
          <tr>
            <th className="py-3 px-4 text-gray-600">이름</th>
            <th className="py-3 px-4 text-gray-600">연락처</th>
            <th className="py-3 px-4 text-gray-600">노선</th>
            <th className="py-3 px-4 text-gray-600">상태</th>
            <th className="py-3 px-4 text-gray-600">수정</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d, idx) => (
            <tr key={idx} className="hover:bg-blue-50 transition">
              <td className="py-3 px-4 text-blue-600 hover:underline cursor-pointer" onClick={() => onUserNameClick && onUserNameClick(d.email)}>{d.name}</td>
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
                  수정
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
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {/* 운전자 추가 모달 */}
      {addOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">운전자 추가</h2>
            <form onSubmit={e => {
              e.preventDefault();
              const form = e.target;
              handleAdd({
                name: form.name.value,
                phone: form.phone.value,
                route: form.route.value,
                email: form.email.value,
              });
              setAddOpen(false);
              form.reset();
            }} className="flex flex-col gap-3">
              <input name="name" placeholder="이름" className="border rounded p-2" required />
              <input name="phone" placeholder="연락처" className="border rounded p-2" required />
              <input name="route" placeholder="노선" className="border rounded p-2" required />
              <input name="email" placeholder="이메일" className="border rounded p-2" required />
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">추가</button>
                <button type="button" onClick={() => setAddOpen(false)} className="bg-gray-200 px-4 py-2 rounded">취소</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
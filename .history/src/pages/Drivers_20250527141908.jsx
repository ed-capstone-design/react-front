import React, { useState } from "react";
import UserDetailModal from "../components/UserDetailModal";

const Drivers = ({ onEditUserDetail }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">운전자 관리</h2>
      <table className="w-full bg-white rounded shadow text-left">
        <thead>
          <tr>
            <th className="py-2 px-4">이름</th>
            <th className="py-2 px-4">연락처</th>
            <th className="py-2 px-4">노선</th>
            <th className="py-2 px-4">상세</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>홍길동</td>
            <td>010-1234-5678</td>
            <td>101번</td>
            <td>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setModalOpen(true)}
              >
                상세보기
              </button>
            </td>
          </tr>
          <tr>
            <td>김철수</td>
            <td>010-9876-5432</td>
            <td>202번</td>
            <td>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setModalOpen(true)}
              >
                상세보기
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <UserDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onEdit={() => {
          setModalOpen(false);
          onEditUserDetail && onEditUserDetail();
        }}
      />
    </div>
  );
};

export default Drivers;
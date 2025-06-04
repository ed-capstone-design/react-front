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
    <div className="max-w-5xl mx-auto py-10 px-4">
      
    </div>
  );
};

export default Drivers;
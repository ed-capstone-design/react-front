import React, { useState } from "react";
import axios from "axios";
import { useToast } from "../Toast/ToastProvider";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

const AddDriverModal = ({ open, onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const toast = useToast();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newDriver = {
      name,
      phoneNumber,
      licenseType,
      operatorId: operatorId ? parseInt(operatorId) : null,
      status: "ACTIVE"
    };

    try {
      const response = await axios.post("/api/drivers", newDriver);
      onAdd(response.data);
      onClose();
      toast.success("운전자가 추가되었습니다!");
      setName("");
      setPhoneNumber("");
      setLicenseType("");
      setOperatorId("");
    } catch (error) {
      console.error("운전자 추가 실패:", error);
      toast.error("운전자 추가에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">운전자 추가</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="이름" 
            className="border rounded p-2" 
            required 
          />
          <input 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="전화번호" 
            className="border rounded p-2" 
            required 
          />
          <select
            value={licenseType}
            onChange={(e) => setLicenseType(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">면허 종류 선택</option>
            <option value="1종 보통">1종 보통</option>
            <option value="1종 대형">1종 대형</option>
            <option value="2종 보통">2종 보통</option>
            <option value="특수면허">특수면허</option>
          </select>
          <input 
            value={operatorId} 
            onChange={(e) => setOperatorId(e.target.value)}
            placeholder="운영자 ID (선택사항)" 
            className="border rounded p-2" 
            type="number"
          />
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">추가</button>
            <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">취소</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDriverModal;

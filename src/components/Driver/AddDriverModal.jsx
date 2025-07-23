import React, { useState } from "react";
import axios from "axios";

const AddDriverModal = ({ open, onClose, onAdd }) => {
  const [form, setForm] = useState({
    driverName: "",
    driverPassword: "",
    licenseNumber: "",
    operatorId: "",
    careerYears: "",
    avgDrivingScore: "",
    grade: "",
    driverImagePath: "",
    status: "대기",
  });

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/drivers", {
        ...form,
        operatorId: Number(form.operatorId),
        careerYears: Number(form.careerYears),
        avgDrivingScore: Number(form.avgDrivingScore),
      });
      onAdd(res.data); // 부모에서 목록에 추가
      setForm({
        driverName: "",
        driverPassword: "",
        licenseNumber: "",
        operatorId: "",
        careerYears: "",
        avgDrivingScore: "",
        grade: "",
        driverImagePath: "",
        status: "대기",
      });
      onClose();
    } catch {
      alert("운전자 추가 실패");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">운전자 추가</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="driverName" value={form.driverName} onChange={handleChange} placeholder="이름" className="border rounded p-2" required />
          <input name="driverPassword" value={form.driverPassword} onChange={handleChange} placeholder="비밀번호" className="border rounded p-2" required />
          <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder="면허번호" className="border rounded p-2" required />
          <input name="operatorId" value={form.operatorId} onChange={handleChange} placeholder="운영사 ID" className="border rounded p-2" required type="number" />
          <input name="careerYears" value={form.careerYears} onChange={handleChange} placeholder="경력(년)" className="border rounded p-2" required type="number" />
          <input name="avgDrivingScore" value={form.avgDrivingScore} onChange={handleChange} placeholder="평균점수" className="border rounded p-2" required type="number" step="0.01" />
          <select name="grade" value={form.grade} onChange={handleChange} className="border rounded p-2" required>
            <option value="">등급 선택</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
          </select>
          <input name="driverImagePath" value={form.driverImagePath} onChange={handleChange} placeholder="이미지 경로" className="border rounded p-2" />
          <select name="status" value={form.status} onChange={handleChange} className="border rounded p-2" required>
            <option value="운행중">운행중</option>
            <option value="대기">대기</option>
            <option value="휴식">휴식</option>
          </select>
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

import React, { useState, useContext } from "react";
import { DriverContext } from "./DriverContext";

const DriverDetailModal = ({ open, driver, onClose }) => {
  const [form, setForm] = useState(driver || {});

  React.useEffect(() => {
    setForm(driver || {});
  }, [driver]);
  const { updateDriver, deleteDriver } = useContext(DriverContext);

  if (!open || !driver) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDriver({ ...form, driverId: driver.driverId });
      onClose();
    } catch {
      alert("운전자 정보 수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteDriver(driver.driverId);
        onClose();
      } catch {
        alert("운전자 삭제에 실패했습니다.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">운전자 상세/수정</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="driverName" value={form.driverName || ""} onChange={handleChange} placeholder="이름" className="border rounded p-2" required />
          <input name="phone" value={form.phone || ""} onChange={handleChange} placeholder="연락처" className="border rounded p-2" required />
          <input name="licenseNumber" value={form.licenseNumber || ""} onChange={handleChange} placeholder="면허번호" className="border rounded p-2" required />
          <input name="careerYears" value={form.careerYears || ""} onChange={handleChange} placeholder="경력(년)" className="border rounded p-2" />
          <input name="grade" value={form.grade || ""} onChange={handleChange} placeholder="등급" className="border rounded p-2" />
          <input name="driverImagePath" value={form.driverImagePath || ""} onChange={handleChange} placeholder="이미지 경로" className="border rounded p-2" />
          <select name="status" value={form.status || "대기"} onChange={handleChange} className="border rounded p-2">
            <option value="운행중">운행중</option>
            <option value="대기">대기</option>
            <option value="휴식">휴식</option>
          </select>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">수정</button>
            <button type="button" onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">삭제</button>
            <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">닫기</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverDetailModal;

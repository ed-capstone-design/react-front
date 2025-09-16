import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { DriverContext } from "./DriverContext";
import { useToast } from "../Toast/ToastProvider";
import axios from "axios";

const EditDriverModal = ({ open, onClose, driver }) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licenseNumber, setlicenseNumber] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [status, setStatus] = useState("DRIVING");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const driverCtx = useContext(DriverContext);
  useEffect(() => {
    if (driver) {
      setName(driver.name || "");
      setPhoneNumber(driver.phoneNumber || "");
      setlicenseNumber(driver.licenseNumber || "");
      setOperatorId(driver.operatorId || "");
      setStatus(driver.status || "DRIVING");
    }
  }, [driver]);
  if (!driverCtx || typeof driverCtx.updateDriver !== "function") {
    return (
      <div className="p-8 bg-white rounded-lg shadow-lg text-red-500 text-center">
        DriverProvider로 감싸지 않았거나 DriverContext가 올바르지 않습니다.<br />
        관리자에게 문의하세요.
      </div>
    );
  }
  const { updateDriver } = driverCtx;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phoneNumber) {
      toast.warning("이름과 전화번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const updatedDriver = {
        driverId: driver.driverId,
        driverName: name,
        phoneNumber,
        licenseNumber,
        operatorId: operatorId ? parseInt(operatorId) : undefined,
        status
      };
      await updateDriver(updatedDriver);
      onClose();
      toast.success("운전자 정보가 수정되었습니다!");
      setName("");
      setPhoneNumber("");
      setlicenseNumber("");
      setOperatorId("");
      setStatus("ACTIVE");
    } catch (error) {
      toast.error("운전자 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!driver || !driver.driverId) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setLoading(true);
    try {
      await axios.delete(`/api/drivers/${driver.driverId}`);
      toast.success("운전자가 삭제되었습니다.");
      onClose();
    } catch (error) {
      toast.error("운전자 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-2 border border-gray-100 relative p-0 animate-fade-in transition-all duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-300 hover:text-blue-400 text-xl font-light transition-colors z-10"
          aria-label="닫기"
        >
          ×
        </button>
        <div className="p-7 pb-4">
          <h3 className="text-xl font-bold mb-6 text-gray-800 tracking-tight leading-tight pl-1">운전자 정보 수정</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">이름 <span className="text-red-400">*</span></label>
              <input
                type="text"
                className="w-full border border-gray-200 focus:border-blue-400 rounded px-3 py-2 text-sm outline-none bg-white focus:bg-blue-50 transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="이름"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">전화번호 <span className="text-red-400">*</span></label>
              <input
                type="tel"
                className="w-full border border-gray-200 focus:border-blue-400 rounded px-3 py-2 text-sm outline-none bg-white focus:bg-blue-50 transition"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="010-1234-5678"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">면허 번호 <span className="text-red-400">*</span></label>
              <input
                type="text"
                className="w-full border border-gray-200 focus:border-blue-400 rounded px-3 py-2 text-sm outline-none bg-white focus:bg-blue-50 transition"
                value={licenseNumber}
                onChange={(e) => setlicenseNumber(e.target.value)}
                required
                placeholder="예: 12-34-567890"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">운영자 ID</label>
              <input
                type="number"
                className="w-full border border-gray-200 focus:border-blue-400 rounded px-3 py-2 text-sm outline-none bg-white focus:bg-blue-50 transition"
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                placeholder="선택사항"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">상태</label>
              <select
                className="w-full border border-gray-200 focus:border-blue-400 rounded px-3 py-2 text-sm outline-none bg-white focus:bg-blue-50 transition"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="DRIVING">운행중</option>
                <option value="BREAK">휴식</option>
                <option value="OFF">휴무</option>
              </select>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 text-xs transition disabled:opacity-50 border border-red-400"
                disabled={loading}
              >
                삭제
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 text-xs transition disabled:opacity-50 border border-blue-400"
                disabled={loading}
              >
                {loading ? "수정 중..." : "수정"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDriverModal;

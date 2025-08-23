import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { DriverContext } from "./DriverContext";
import { useToast } from "../Toast/ToastProvider";

const EditDriverModal = ({ open, onClose, driver }) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const driverCtx = useContext(DriverContext);
  useEffect(() => {
    if (driver) {
      setName(driver.name || "");
      setPhoneNumber(driver.phoneNumber || "");
      setLicenseType(driver.licenseType || "");
      setOperatorId(driver.operatorId || "");
      setStatus(driver.status || "ACTIVE");
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
        licenseType,
        operatorId: operatorId ? parseInt(operatorId) : undefined,
        status
      };
      await updateDriver(updatedDriver);
      onClose();
      toast.success("운전자 정보가 수정되었습니다!");
      setName("");
      setPhoneNumber("");
      setLicenseType("");
      setOperatorId("");
      setStatus("ACTIVE");
    } catch (error) {
      toast.error("운전자 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h3 className="text-lg font-bold mb-4">운전자 정보 수정</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">이름 *</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">전화번호 *</label>
            <input
              type="tel"
              className="w-full border rounded px-3 py-2"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">면허 종류</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={licenseType}
              onChange={(e) => setLicenseType(e.target.value)}
            >
              <option value="">선택하세요</option>
              <option value="1종 보통">1종 보통</option>
              <option value="1종 대형">1종 대형</option>
              <option value="2종 보통">2종 보통</option>
              <option value="특수면허">특수면허</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">운영자 ID</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              placeholder="선택사항"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">상태</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
              <option value="ON_DUTY">근무중</option>
              <option value="OFF_DUTY">휴무</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "수정 중..." : "수정"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDriverModal;

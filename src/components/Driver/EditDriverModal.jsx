import React, { useState, useEffect } from "react";
import { useDriverAPI } from "../../hooks/useDriverAPI";
import { useToast } from "../Toast/ToastProvider";

const EditDriverModal = ({ open, onClose, driver, onUpdateSuccess }) => {
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licenseNumber, setlicenseNumber] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { updateDriver: updateDriverAPI, deleteDriver: deleteDriverAPI } = useDriverAPI();
  
  useEffect(() => {
    if (driver) {
      setUsername(driver.username || "");
      setPhoneNumber(driver.phoneNumber || "");
      setlicenseNumber(driver.licenseNumber || "");
      setOperatorName(driver.operatorName || "");
      setGrade(driver.grade || "");
    }
  }, [driver]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !phoneNumber) {
      toast.warning("이름과 전화번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const updatedDriver = {
        userId: driver.userId,
        username: username,
        phoneNumber,
        licenseNumber,
        operatorName: operatorName ? parseInt(operatorName) : undefined,
        grade
      };
      
      const result = await updateDriverAPI(updatedDriver);
      
      if (result.success) {
        onClose();
        toast.success("운전자 정보가 수정되었습니다!");
        setUsername("");
        setPhoneNumber("");
        setlicenseNumber("");
        setOperatorName("");
        setGrade("");
        // 부모 컴포넌트에 업데이트 성공 알림
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
      } else {
        toast.error(result.error || "운전자 정보 수정에 실패했습니다.");
      }
    } catch (error) {
      toast.error("운전자 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!driver || !driver.userId) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setLoading(true);
    try {
      const result = await deleteDriverAPI(driver.userId);
      
      if (result.success) {
        toast.success("운전자가 삭제되었습니다.");
        onClose();
        // 부모 컴포넌트에 업데이트 성공 알림
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
      } else {
        toast.error(result.error || "운전자 삭제에 실패했습니다.");
      }
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              <label className="block mb-1 text-xs font-medium text-gray-600">등급</label>
              <select
                className="w-full border border-gray-200 focus:border-blue-400 rounded px-3 py-2 text-sm outline-none bg-white focus:bg-blue-50 transition"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="">선택하세요</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
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

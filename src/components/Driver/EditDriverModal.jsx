import { useState, useEffect } from "react";
import { useToast } from "../Toast/ToastProvider";
import { useUpdateDriver, useDeleteDriver } from "../../hooks/QueryLayer/useDriver";
const EditDriverModal = ({ open, onClose, driver, onUpdateSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licenseNumber, setlicenseNumber] = useState("");
  const [careerYears, setCareerYears] = useState("");
  const [grade, setGrade] = useState("");
  const toast = useToast();

  const { mutate: updateDriver, isPending: isUpdating } = useUpdateDriver();
  const { mutate: deleteDriver, isPending: isDeleting } = useDeleteDriver();


  useEffect(() => {
    if (driver) {
      setPhoneNumber(driver.phoneNumber || "");
      setlicenseNumber(driver.licenseNumber || "");
      setCareerYears(driver.careerYears || "");
      setGrade(driver.grade || "");
    }
  }, [driver]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phoneNumber || !licenseNumber || !careerYears || !grade) {
      toast.warning("모든 필드를 입력해주세요.");
      return;
    }
    const updateData = {
      phoneNumber,
      licenseNumber,
      careerYears: Number(careerYears),
      grade,
    }
    updateDriver({ driverId: driver.userId, updateData }, {
      onSuccess: () => {
        toast.success("운전자가 수정되었습니다.");
        onUpdateSuccess?.();
        onClose();
      },
      onError: (error) => {
        const message = error.response?.data?.message || "수정 실패";
        toast.error(message);
      }
    }
    )
  };

  const handleDelete = async () => {
    if (!driver || !driver.userId) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    deleteDriver(driver.userId, {
      onSuccess: () => {
        toast.success("운전자가 삭제되었습니다.");
        onUpdateSuccess?.();
        onClose();
      },
      onError: (error) => {
        const message = error.response?.data?.message || "삭제 실패";
        toast.error(message);
      }
    }
    )
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-2 border border-gray-100 relative p-0 animate-fade-in transition-all duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-300 hover:text-blue-400 text-xl font-light transition-colors z-10"
          aria-label="닫기"
        >
          ×
        </button>
        <div className="p-7 pb-4">
          <h3 className="text-xl font-bold mb-6 text-gray-800 tracking-tight leading-tight pl-1">{driver?.username} 정보 수정</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block mb-1 text-xs font-medium text-gray-600">경력 (년) <span className="text-red-400">*</span></label>
              <input
                type="number"
                className="w-full border border-gray-200 focus:border-blue-400 rounded px-3 py-2 text-sm outline-none bg-white focus:bg-blue-50 transition"
                value={careerYears}
                onChange={(e) => setCareerYears(e.target.value)}
                required
                placeholder="경력 년수"
                min="0"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">등급 <span className="text-red-400">*</span></label>
              <select
                className="w-full border border-gray-200 focus:border-blue-400 rounded px-3 py-2 text-sm outline-none bg-white focus:bg-blue-50 transition"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
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
                disabled={isDeleting}
              >
                삭제
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 text-xs transition disabled:opacity-50 border border-blue-400"
                disabled={isUpdating}
              >
                {isUpdating ? "수정 중..." : "수정"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDriverModal;

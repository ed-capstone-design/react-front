import React from "react";
import { IoSave, IoTrash } from "react-icons/io5";

const ProfileActions = ({ loading, onSave, onDelete }) => {
  return (
    <div className="flex justify-between items-center pt-6">
      <button
        onClick={onDelete}
        disabled={loading}
        type="button"
        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition"
      >
        <IoTrash />
        탈퇴
      </button>
      
      <button
        onClick={onSave}
        disabled={loading}
        type="submit"
        className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition"
      >
        <IoSave />
        {loading ? "저장 중..." : "변경사항 저장"}
      </button>
    </div>
  );
};

export default ProfileActions;

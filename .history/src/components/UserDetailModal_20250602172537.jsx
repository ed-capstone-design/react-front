import React, { useState, useEffect } from "react";
import { IoPersonCircle } from "react-icons/io5";

const UserDetailModal = ({ open, onClose, user, onEdit, onDelete }) => {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(user || {});

  useEffect(() => {
    setForm(user || {});
    setEditMode(false);
  }, [user, open]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit && onEdit(form);
    setEditMode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-3xl transition"
          onClick={onClose}
          aria-label="닫기"
        >
          &times;
        </button>
        <div className="flex flex-col items-center mb-6">
          <IoPersonCircle className="text-blue-500 text-6xl mb-2 drop-shadow" />
          {editMode ? (
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              className="text-2xl font-extrabold text-blue-700 mb-1 text-center border-b border-blue-200 focus:outline-none focus:border-blue-500"
            />
          ) : (
            <h2 className="text-2xl font-extrabold text-blue-700 mb-1">
              {user?.name}
            </h2>
          )}
          <span className="text-gray-500 text-sm">{user?.email}</span>
        </div>
        <div className="divide-y divide-blue-100 mb-6">
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-blue-700">가입일</span>
            <span className="text-gray-700">{user?.joinDate}</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-blue-700">상태</span>
            {editMode ? (
              <select
                name="status"
                value={form.status || ""}
                onChange={handleChange}
                className="border rounded p-1"
              >
                <option value="활성">활성</option>
                <option value="비활성">비활성</option>
              </select>
            ) : (
              <span
                className={
                  user?.status === "활성"
                    ? "text-green-600 font-bold"
                    : "text-gray-500 font-bold"
                }
              >
                {user?.status}
              </span>
            )}
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-blue-700">노선</span>
            {editMode ? (
              <input
                name="route"
                value={form.route || ""}
                onChange={handleChange}
                className="border rounded p-1"
              />
            ) : (
              <span className="text-gray-700">{user?.route}</span>
            )}
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-blue-700">연락처</span>
            {editMode ? (
              <input
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                className="border rounded p-1"
              />
            ) : (
              <span className="text-gray-700">{user?.phone}</span>
            )}
          </div>
        </div>
        {editMode ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
            >
              저장
            </button>
            <button
              type="button"
              className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition"
              onClick={() => setEditMode(false)}
            >
              취소
            </button>
          </form>
        ) : (
          <div className="flex gap-2">
            <button
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
              onClick={() => setEditMode(true)}
            >
              수정
            </button>
            <button
              className="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition"
              onClick={() => onDelete && onDelete(user.email)}
            >
              삭제
            </button>
          </div>
        )}
      </div>
      <style>{`
        .animate-fade-in {
          animation: fade-in 0.25s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
};

export default UserDetailModal;
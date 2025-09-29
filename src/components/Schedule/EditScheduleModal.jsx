import React from "react";

const EditScheduleModal = ({ open, onClose, title = "스케줄 수정", children, onSubmit }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <form
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative animate-fade-in"
        onSubmit={onSubmit}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-3xl transition"
          onClick={onClose}
          type="button"
          aria-label="닫기"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6 text-blue-700">{title}</h2>
        {children}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition"
        >
          수정
        </button>
      </form>
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

export default EditScheduleModal;

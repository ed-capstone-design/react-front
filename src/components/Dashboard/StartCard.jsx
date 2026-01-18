export const StatCard = ({ title, value, unit, color = "gray" }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        {/* 제목 표시 */}
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        {/* 강조된 숫자와 단위 */}
        <p className={`text-2xl font-bold text-${color}-600`}>
            {value}
            <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
        </p>
    </div>
);
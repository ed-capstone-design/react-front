import React, { useContext } from "react";

const statusIcon = (status) => {
    if (status === "운행중") return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2 align-middle" title="운행중"></span>;
    if (status === "대기") return <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2 align-middle" title="대기"></span>;
    if (status === "휴식") return <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2 align-middle" title="휴식"></span>;
    return <span className="inline-block w-3 h-3 rounded-full bg-gray-200 mr-2 align-middle" title={status}></span>;
};

const Driver = ({ driver }) => {
    if (!driver) return null;
    return (
        <div className="max-w-5xl mx-auto py-10 px-6">
            <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4 border border-gray-100">
                <div className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                    {statusIcon(driver.status)}
                    {driver.name}
                </div>

                {/* 기타 정보 렌더링 */}
            </div>
        </div>
    );
};

export default Driver;
import React, { useContext } from "react";

const Driver = ({ driver }) => {
    if (!driver) return null;
    return (
        <div className="max-w-5xl mx-auto py-10 px-6">
            <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4 border border-gray-100">
                <div className="text-2xl font-bold text-gray-800 mb-2">{driver.name}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="font-semibold text-gray-600">운전자 ID:</span> {driver.id}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-600">계정 ID(user_id):</span> {driver.user_id}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-600">연락처:</span> {driver.phone}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-600">면허번호:</span> {driver.license_no}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-600">입사일:</span> {driver.hire_date}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-600">운행상태:</span> <span className={
                            driver.status === "운행중" ? "text-green-600 font-bold" :
                            driver.status === "대기" ? "text-yellow-500 font-bold" :
                            driver.status === "퇴사" ? "text-gray-400 font-bold" : ""
                        }>{driver.status}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-gray-600">주소:</span> {driver.address}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-600">등록일:</span> {driver.created_at}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-600">수정일:</span> {driver.updated_at}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Driver;
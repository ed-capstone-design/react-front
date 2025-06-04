import React, { useContext } from "react";

const Driver = ({ driver }) => {
    if (!driver) return null;
    return (
        <div className="max-w-5xl mx-auto py-10 px-6">
            <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4 border border-gray-100">
                <div className="text-2xl font-bold text-gray-800 mb-2">{driver.name}</div>

                    <div>
                        <span className="font-semibold text-gray-600">운행상태:</span> <span className={
                            driver.status === "운행중" ? "text-green-600 font-bold" :
                            driver.status === "대기" ? "text-yellow-500 font-bold" :
                            driver.status === "퇴사" ? "text-gray-400 font-bold" : ""
                        }>{driver.status}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Driver;
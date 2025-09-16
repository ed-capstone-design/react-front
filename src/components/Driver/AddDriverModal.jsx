// import React, { useState } from "react";
// import { useToast } from "../Toast/ToastProvider";
// import { useContext } from "react";
// import { DriverContext } from "./DriverContext";
// import axios from "axios";
// // axios 기본 URL 설정
// axios.defaults.baseURL = "http://localhost:8080";

// const AddDriverModal = ({ open, onClose, onAdd }) => {
//   const [name, setName] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [licenseNumber, setLicenseNumber] = useState("");
//   const [operatorId, setOperatorId] = useState("");
//   const [grade, setGrade] = useState("");
//   const [careerYears, setCareerYears] = useState("");
//   const [driverPassword, setDriverPassword] = useState("");
//   const [avgDrivingScore, setAvgDrivingScore] = useState("");
//   const [driverImagePath, setDriverImagePath] = useState("");
//   const toast = useToast();
//   const driverCtx = useContext(DriverContext);
//   if (!driverCtx || typeof driverCtx.addDriver !== "function") {
//     return (
//       <div className="p-8 bg-white rounded-lg shadow-lg text-red-500 text-center">
//         DriverProvider로 감싸지 않았거나 DriverContext가 올바르지 않습니다.<br />
//         관리자에게 문의하세요.
//       </div>
//     );
//   }
//   const { addDriver } = driverCtx;

//   if (!open) return null;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newDriver = {
//       driverName: name,
//       phoneNumber,
//       licenseNumber,
//       operatorId: operatorId ? parseInt(operatorId) : undefined,
//       grade,
//       careerYears: careerYears ? parseInt(careerYears) : undefined,
//       driverPassword,
//       avgDrivingScore: avgDrivingScore ? parseFloat(avgDrivingScore) : undefined,
//       driverImagePath
//     };
//     try {
//       await addDriver(newDriver);
//       onClose();
//       toast.success("운전자가 추가되었습니다!");
//   setName("");
//   setPhoneNumber("");
//   setLicenseNumber("");
//   setOperatorId("");
//   setGrade("");
//   setCareerYears("");
//   setDriverPassword("");
//   setAvgDrivingScore("");
//   setDriverImagePath("");
//     } catch (error) {
//       toast.error("운전자 추가에 실패했습니다.");
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
//         <h2 className="text-xl font-bold mb-4">운전자 추가</h2>
//         <form onSubmit={handleSubmit} className="flex flex-col gap-3">
//           <input 
//             value={name} 
//             onChange={(e) => setName(e.target.value)}
//             placeholder="이름" 
//             className="border rounded p-2" 
//             required 
//           />
//           <input 
//             value={driverPassword}
//             onChange={(e) => setDriverPassword(e.target.value)}
//             placeholder="비밀번호" 
//             className="border rounded p-2" 
//             type="password"
//             required
//           />
//           <input 
//             value={phoneNumber} 
//             onChange={(e) => setPhoneNumber(e.target.value)}
//             placeholder="휴대폰번호" 
//             className="border rounded p-2" 
//             required 
//           />
//           <input 
//             value={licenseNumber} 
//             onChange={(e) => setLicenseNumber(e.target.value)}
//             placeholder="면허번호" 
//             className="border rounded p-2" 
//             required 
//           />
//           <input 
//             value={operatorId} 
//             onChange={(e) => setOperatorId(e.target.value)}
//             placeholder="운영사 ID" 
//             className="border rounded p-2" 
//             type="number"
//             required
//           />
//           <input 
//             value={careerYears}
//             onChange={(e) => setCareerYears(e.target.value)}
//             placeholder="경력(년)"
//             className="border rounded p-2"
//             type="number"
//             min="0"
//             required
//           />
//           <input 
//             value={avgDrivingScore}
//             onChange={(e) => setAvgDrivingScore(e.target.value)}
//             placeholder="평균점수"
//             className="border rounded p-2"
//             type="number"
//             min="0"
//             step="0.01"
//           />
//           <select
//             value={grade}
//             onChange={(e) => setGrade(e.target.value)}
//             className="border rounded p-2"
//             required
//           >
//             <option value="">등급 선택</option>
//             <option value="A">A</option>
//             <option value="B">B</option>
//             <option value="C">C</option>
//             <option value="D">D</option>
//             <option value="E">E</option>
//           </select>
//           <input 
//             value={driverImagePath}
//             onChange={(e) => setDriverImagePath(e.target.value)}
//             placeholder="이미지 경로"
//             className="border rounded p-2"
//             type="text"
//           />
//           <div className="flex gap-2 mt-4">
//             <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">추가</button>
//             <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">취소</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddDriverModal;
//비활성화
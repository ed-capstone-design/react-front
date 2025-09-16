// import React, { useEffect, useRef } from "react";

// export const WebSocketContext = React.createContext(null);

// export const WebSocketProvider = ({ children }) => {
//     const ws = useRef(null);

//     useEffect(() => {
//         ws.current = new WebSocket("ws://localhost:8080/ws-endpoint"); // 서버주소
//         ws.current.onopen = () => {
//             console.log("[WebSocket] 연결 성공");
//         };
//         ws.current.onclose = () => {
//             console.log("[WebSocket] 연결 종료");
//         };
//         ws.current.onerror = (err) => {
//             console.error("[WebSocket] 에러:", err);
//         };
//         return () => {
//             if (ws.current) {
//                 ws.current.close(); // 컴포넌트 언마운트 시 연결 해제
//             }
//         };
//     }, []);

//     return (
//         <WebSocketContext.Provider value={ws.current}>
//             {children}
//         </WebSocketContext.Provider>
//     );
// }
import { createContext, useContext, useEffect } from "react";
import { useAuthContext } from "./AuthProvider";
import { webSockSession } from "../WebSocket/WebSocketSession";


const webSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const { isLoggedIn } = useAuthContext();
    useEffect(() => {
        if (isLoggedIn) {
            console.log("🔌 [Provider] 로그인 감지 -> 소켓 연결 시도");
            webSockSession.connect();
        } else {
            console.log("🔌 [Provider] 로그아웃 감지 -> 소켓 연결 해제");
            webSockSession.disconnect();
        }
        return () => {//클린업으로 앱이 종료된 시점이면 연결 해제
            webSockSession.disconnect();
        };
    }, [isLoggedIn]);


    return (
        <webSocketContext.Provider value={{ webSockSession }}>
            {children}
        </webSocketContext.Provider>
    )
}

export const useWebSocketContext = () => {
    const context = useContext(webSocketContext);
    if (!context) {
        throw new Error("webSocketContext 범위 밖의 context 접근입니다.");
    }
    return context;
}
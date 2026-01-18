import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { authManager } from "../components/Token/authManager";

const baseURL = process.env.REACT_APP_WS_URL;

export const createWebSocketClient = ({ onConnect, onDisconnect, onError }) => {
  const SocketFactory = () => new SockJS(baseURL);

  const client = new Client({
    webSocketFactory: SocketFactory,

    reconnectDelay: 5 * 1000,
    heartbeatIncoming: 4 * 1000,
    heartbeatOutgoing: 4 * 1000,

    beforeConnect: () => {
      const token = authManager.getToken();

      client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    },

    onConnect: (frame) => {
      console.log(`[SocketClient]연결${frame.headers}`);
      if (onConnect) {
        onConnect(frame);
      }
    },

    onWebSocketError: (event) => {
      console.warn("[Socket] WebSocket 네트워크 에러", event);
      onError?.({ type: "NETWORK", event });
    },
    onStompError: (frame) => {
      const message = frame.headers["message"];

      if (message?.includes("401") || message?.includes("Unauthorized")) {
        console.warn("[Stomp] 인증 오류 → 로그아웃");
        authManager.logout();
        onError?.({ type: "AUTH", message });
        return;
      }

      onError?.({ type: "STOMP", message, frame });
    },

    onWebSocketClose: (event) => {
      console.log(`[SocketClient] 소켓 연결 끊김 ${event.code}`);
      if (onDisconnect) onDisconnect(event);
    },
    debug: (str) => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[STOMP Debug]", str);
      }
    },
  });
  return client;
};

import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { tokenStorage } from "../Token/tokenStorage";

const baseURL = process.env.REACT_APP_WS_URL;

export const createWebSocketClient = ({ onConnect, onDisconnect, onError }) => {
  const SocketFactory = () => new SockJS(baseURL);

  const client = new Client({
    webSocketFactory: SocketFactory,

    reconnectDelay: 5 * 1000,
    heartbeatIncoming: 4 * 1000,
    heartbeatOutgoing: 4 * 1000,

    beforeConnect: () => {
      const freshToken = tokenStorage.get();
      if (!freshToken) {
        console.warn("[SocketClient] 연결 실패: Token 없음");
      }
      client.connectHeaders = {
        Authorization: `Bearer ${freshToken}`,
      };
      console.log("[SocketClient] Header 토큰 주입 완료");
    },
    onConnect: (frame) => {
      console.log(`[,sSocketClient]연결${frame.headers}`);
      if (onConnect) {
        onConnect(frame);
      }
    },

    onError: (frame) => {
      console.error(" [SocketClient] 브로커 에러:", frame.headers["message"]);
      console.error("상세 내용:", frame.body);
      if (onError) onError(frame);
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

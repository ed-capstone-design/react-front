import { createWebSocketClient } from "./WebSocketClient";

class WebSockSession {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectListeners = new Set();
  }
  connect() {
    if (this.client && this.isConnected) return;
    this.client = createWebSocketClient({
      onConnect: () => {
        this.isConnected = true;
        this.__notifyConnect();
        console.log("[Session]연결 성공 Broker 복구 시작");
      },
      onDisconnect: () => {
        this.isConnected = false;
        console.log("[Session] 연결 끊김");
      },
      onError: (error) => {
        switch (error.type) {
          case "AUTH":
            console.warn("[Session]]인증 만료 세션 종료");
            this.disconnect();
            this.client?.deactivate();
            break;
          case "STOMP":
            console.error("[Session] STOMP 프로토콜 에러:", error.message);
            break;
          case "NETWORK":
            console.warn("⚠️ [Session] 네트워크 불안정:", error.event);
            break;
          default:
            console.error("Unknown Error", error);
        }
      },
    });
    this.client.activate();
  }
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }
  getClient() {
    return this.client;
  }
  onConnect(callback) {
    this.connectListeners.add(callback);
    return () => this.connectListeners.delete(callback);
  }
  __notifyConnect() {
    this.connectListeners.forEach((listener) => listener());
  }
}

export const webSockSession = new WebSockSession();

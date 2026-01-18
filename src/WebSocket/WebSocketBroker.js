import { webSockSession } from "./WebSocketSession";

class WebSocketBroker {
  constructor() {
    this.listeners = new Map();
    this.stompSubscription = new Map();
    webSockSession.onConnect(() => {
      console.log("[Broker]세션 연결 감지- 구독 복구");
      this._recoverSubscriptions();
    });
  }
  subscribe(topic, callback) {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    this.listeners.get(topic).add(callback);
    const client = webSockSession.getClient();
    const isConnect = webSockSession.isConnected;

    if (client && isConnect && !this.stompSubscription.has(topic)) {
      this._performStompSubscribe(client, topic);
    }
  }
  unsubscribe(topic, callback) {
    const topicListeners = this.listeners.get(topic);
    if (topicListeners) {
      topicListeners.delete(callback);
      if (topicListeners.size === 0) {
        this._performStompUnSubscribe(topic);
        this.listeners.delete(topic);
      }
    }
  }
  //서버에 구독 요청
  _performStompSubscribe(client, topic) {
    console.log(`🔔 [Broker] 서버 구독 요청: ${topic}`);

    const subscription = client.subscribe(topic, (message) => {
      try {
        const body = JSON.parse(message.body);
        const listeners = this.listeners.get(topic);
        if (listeners) {
          listeners.forEach((listener) => listener(body));
        }
      } catch (error) {
        console.log(`구독 실패:${topic}`);
      }
    });
    this.stompSubscription.set(topic, subscription);
  }
  _performStompUnSubscribe(topic) {
    const subscription = this.stompSubscription.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.stompSubscription.delete(topic);
      console.log(`[Broker]서버 구독 해제:${topic}`);
    }
  }
  _recoverSubscriptions() {
    const client = webSockSession.getClient();
    if (!client || !client.active) return;
    this.listeners.forEach((_, topic) => {
      if (!this.stompSubscription.has(topic)) {
        this._performStompSubscribe(client, topic);
      }
    });
  }
}

export const webSocketBroker = new WebSocketBroker();

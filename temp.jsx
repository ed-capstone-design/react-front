import { createWebSocketClient } from "./WebSocketClient"; // 파일명 주의

class WebSocketService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.stompSubscriptions = new Map();//구독에 대한 Map
        this.listeners = new Map();//구독을 요청한 컴포넌트들을 관리
    }

    connect() {
        if (this.client && this.client.active) return;

        this.client = createWebSocketClient({
            onConnect: () => {
                this.isConnected = true;
                console.log(`[service]연결 성공`);
                this._recoverSubscription();
            },
            onDisconnect: () => {
                this.isConnected = false;
                this.stompSubscriptions.clear();
                console.log("[Service] 연결 해제, 컴포넌트 List 유지");
            },
            onError: (frame) => {
                if (frame.headers["message"]?.includes("401")) {
                    this.disconnect();
                }
            }
        })
        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
        this.isConnected = false;
        this.stompSubscriptions.clear();
        this.listeners.clear();
        console.log("[Service] 완전 종료:로그아웃 ");
    }

    subscribe(topic, callback) {
        if (!this.listeners.has(topic)) {
            this.listeners.set(topic, new Set());
        }
        this.listeners.get(topic).add(callback);
        if (this.isConnected && !this.stompSubscriptions.has(topic)) {
            this._performStompSubscribe(topic);
        }
    }

    unsubscribe(topic, callback) {
        const topicListeners = this.listeners.get(topic);
        if (topicListeners) {
            topicListeners.delete(callback);
            if (topicListeners.size === 0) {
                const receipt = this.stompSubscriptions.get(topic);
                if (receipt) receipt.unsubscribe();
                this.stompSubscriptions.delete(topic);
                this.listeners.delete(topic);
                console.log(`구독 해제:${topic}`)
            }
        }
    }

    //서버에 구독 요청
    _performStompSubscribe(topic) {
        //만약에 클라이언트도 없고 연결도 안됬으면 시도 중지
        if (!this.client || !this.isConnected) return;

        const subscription = this.client.subscribe(topic, (message) => {
            const body = JSON.parse(message.body);

            const topicListeners = this.listeners.get(topic);
            if (topicListeners) {
                topicListeners.forEach((callback) => callback(body));
            }
        });
        this.stompSubscriptions.set(topic, subscription)
    }
    _recoverSubscription() {
        this.listeners.forEach((_, topic) => {
            if (!this.stompSubscriptions.has(topic)) {
                console.log(`♻️ [Service] 구독 자동 복구: ${topic}`);
                this._performStompSubscribe(topic);
            }
        })
    }
}



export const webSocketService = new WebSocketService();
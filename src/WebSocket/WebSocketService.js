import { createWebSocketClient } from "./WebSocketClient"; // 파일명 주의

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.stompSubscriptions = new Map(); // 🧾 물리적 영수증 (서버랑 약속함)
    this.listeners = new Map(); // 👂 대기 명단 (누가 기다리는지)
  }

  // 1. 연결 (시동)
  connect() {
    // 이미 연결됐으면 무시 (방어 코드)
    if (this.client && this.client.active) return;

    this.client = createWebSocketClient({
      onConnect: () => {
        this.isConnected = true;
        console.log("🟢 [Service] 연결 완료! 구독 복구 시작");
        this._recoverSubscription(); // 오타 수정: SubScription -> Subscription
      },
      onDisconnect: () => {
        this.isConnected = false;
        this.stompSubscriptions.clear(); // 연결 끊기면 영수증은 무효
        console.log("🔴 [Service] 끊어짐. (대기 명단은 유지함)");
      },
      onError: (frame) => {
        if (frame.headers["message"]?.includes("401")) {
          console.error("⛔ [Service] 인증 실패: 강제 로그아웃");
          this.disconnect();
        }
      },
    });
    this.client.activate();
  }

  // 2. 연결 종료 (주차)
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.stompSubscriptions.clear();
      // listeners는 지우지 않음 (재로그인 시 복구 위해)
    }
  }

  // 3. 구독 요청 (손님 입장)
  subscribe(topic, callback) {
    // 오타 수정: subcrible -> subscribe
    // A. 대기 명단(Set)에 추가
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    const topicListeners = this.listeners.get(topic);
    topicListeners.add(callback);

    // B. 실제 구독이 필요한가? (이미 영수증이 있으면 안 해도 됨)
    // ⚠️ 수정: this.stompSubscriptions(topic) -> .has(topic)
    const isPhysicallySubscribed = this.stompSubscriptions.has(topic);

    // 연결되어 있고, 아직 구독 안 한 토픽이면 -> 서버에 요청
    if (this.isConnected && !isPhysicallySubscribed) {
      this._performStompSubscribe(topic); // 오타 수정
    }
  }

  // 4. 구독 취소 (손님 퇴장) - 🔥 여기가 제일 중요!
  unsubscribe(topic, callback) {
    // 오타 수정: unSubscribe -> unsubscribe
    const topicListeners = this.listeners.get(topic);

    if (topicListeners) {
      // A. 명단에서 이 사람만 지움
      topicListeners.delete(callback);

      // B. ⚠️ 핵심 로직 수정: "듣는 사람이 0명이 되면" 그때 끊어야 함!
      // 멘티님 코드는 한 명만 나가도 끊어버리는 버그가 있었음
      if (topicListeners.size === 0) {
        const stompSub = this.stompSubscriptions.get(topic);
        if (stompSub) {
          stompSub.unsubscribe(); // 서버에 "이제 그만 보내" 요청
          this.stompSubscriptions.delete(topic); // 영수증 폐기
          this.listeners.delete(topic); // 명단 폐기
          console.log(
            `🔕 [Service] 듣는 사람 없음. 물리적 구독 해제: ${topic}`
          );
        }
      }
    }
  }

  // 🔒 (내부 함수) 실제 서버에 요청 날리기
  // 클래스 안으로 넣어야 함 (메서드)
  _performStompSubscribe(topic) {
    // ⚠️ 로직 수정: 연결이 안 됐으면 리턴해야 함 (!this.isConnected)
    if (!this.client || !this.isConnected) return;

    console.log(`🔔 [Service] 네트워크 구독 요청: ${topic}`);

    const subscription = this.client.subscribe(topic, (message) => {
      const body = JSON.parse(message.body);

      // 메시지 오면 명단에 있는 사람들한테 싹 돌림 (Fan-out)
      const topicListeners = this.listeners.get(topic);
      if (topicListeners) {
        topicListeners.forEach((callback) => callback(body));
      }
    });

    // 영수증 보관
    this.stompSubscriptions.set(topic, subscription);
  }

  // 🔄 (내부 함수) 복구 로직
  _recoverSubscription() {
    this.listeners.forEach((_, topic) => {
      // 영수증 없으면(끊겨서 날아갔으면) 다시 구독
      if (!this.stompSubscriptions.has(topic)) {
        // 오타 수정: subscription -> stompSubscriptions
        console.log(`♻️ [Service] 구독 자동 복구: ${topic}`);
        this._performStompSubscribe(topic);
      }
    });
  }
}

// ⚠️ 수정: 클래스 이름과 인스턴스 이름이 같으면 에러 남
// 소문자로 시작하는 이름으로 변경
export const webSocketService = new WebSocketService();

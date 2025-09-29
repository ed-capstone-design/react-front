import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useToken } from "../components/Token/TokenProvider";

const Ts = () => new Date().toLocaleTimeString();

export default function WsTest() {
  const clientRef = useRef(null);
  const subRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [url, setUrl] = useState("http://localhost:8080/ws");
  const [destination, setDestination] = useState("/topic/operator/1/warnings");
  const { getToken } = useToken();
  const [token, setToken] = useState("");
  const [includeConnectAuth, setIncludeConnectAuth] = useState(true);
  const [includeSubscribeAuth, setIncludeSubscribeAuth] = useState(true);
  const [logs, setLogs] = useState([]);

  const appendLog = useCallback((msg) => {
    setLogs((prev) => [
      `${Ts()} | ${msg}`,
      ...prev
    ].slice(0, 500));
  }, []);

  // 편의: 현재 애플리케이션 토큰을 불러오기
  const loadCurrentToken = useCallback(() => {
    const t = getToken && getToken();
    setToken(t || "");
    appendLog(`현재 토큰 불러옴: ${t ? t.substring(0, 20) + "..." : "없음"}`);
  }, [getToken, appendLog]);

  // 연결
  const connect = useCallback(() => {
    if (clientRef.current?.connected) {
      appendLog("이미 연결 상태입니다.");
      return;
    }

    const sock = new SockJS(url);
    const connectHeaders = includeConnectAuth && token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const client = new Client({
      webSocketFactory: () => sock,
      connectHeaders,
      reconnectDelay: 0,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => appendLog(`[STOMP] ${str}`)
    });

    client.onConnect = (frame) => {
      setIsConnected(true);
      appendLog(`연결 성공: ${JSON.stringify(frame.headers)}`);
    };

    client.onStompError = (frame) => {
      setIsConnected(false);
      appendLog(`STOMP ERROR: ${frame.headers?.message || ""} | body=${frame.body}`);
    };

    client.onDisconnect = () => {
      setIsConnected(false);
      appendLog("연결 종료");
    };

    clientRef.current = client;
    appendLog("클라이언트 활성화 시도");
    client.activate();
  }, [appendLog, includeConnectAuth, token, url]);

  // 해제
  const disconnect = useCallback(() => {
    try {
      if (subRef.current) {
        try { subRef.current.unsubscribe(); } catch {}
        subRef.current = null;
        setIsSubscribed(false);
      }
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    } finally {
      setIsConnected(false);
      appendLog("연결 해제 완료");
    }
  }, [appendLog]);

  // 구독
  const subscribe = useCallback(() => {
    if (!clientRef.current || !clientRef.current.connected) {
      appendLog("먼저 연결하세요.");
      return;
    }
    if (subRef.current) {
      appendLog("이미 구독 중입니다.");
      return;
    }
    try {
      const headers = includeSubscribeAuth && token
        ? { Authorization: `Bearer ${token}` }
        : {};

      subRef.current = clientRef.current.subscribe(
        destination,
        (msg) => {
          appendLog(`수신: destination=${destination} body=${msg.body}`);
        },
        headers
      );
      setIsSubscribed(true);
      appendLog(`구독 시작: ${destination} (${headers.Authorization ? "Authorization 포함" : "무토큰"})`);
    } catch (e) {
      appendLog(`구독 실패: ${e?.message || e}`);
    }
  }, [appendLog, destination, includeSubscribeAuth, token]);

  // 구독 해제
  const unsubscribe = useCallback(() => {
    if (!subRef.current) {
      appendLog("구독이 없습니다.");
      return;
    }
    try {
      subRef.current.unsubscribe();
      subRef.current = null;
      setIsSubscribed(false);
      appendLog("구독 해제 완료");
    } catch (e) {
      appendLog(`구독 해제 실패: ${e?.message || e}`);
    }
  }, [appendLog]);

  // 언마운트 시 정리
  useEffect(() => () => disconnect(), [disconnect]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">WebSocket 구독 테스트</h1>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded shadow space-y-3">
            <h2 className="font-semibold">연결 설정</h2>
            <label className="text-sm text-gray-600">SockJS URL</label>
            <input className="w-full border rounded px-2 py-1" value={url} onChange={(e) => setUrl(e.target.value)} />

            <label className="text-sm text-gray-600">토큰</label>
            <textarea className="w-full border rounded px-2 py-1 h-24" value={token} onChange={(e) => setToken(e.target.value)} placeholder="여기에 테스트할 JWT를 붙여넣기 (빈칸=무토큰)" />

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeConnectAuth} onChange={(e) => setIncludeConnectAuth(e.target.checked)} />
                CONNECT에 Authorization 포함
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeSubscribeAuth} onChange={(e) => setIncludeSubscribeAuth(e.target.checked)} />
                SUBSCRIBE에 Authorization 포함
              </label>
            </div>

            <div className="flex gap-2">
              <button onClick={loadCurrentToken} className="px-3 py-1 text-sm bg-slate-600 text-white rounded">현재 토큰 불러오기</button>
              <button onClick={() => setToken("")} className="px-3 py-1 text-sm bg-gray-500 text-white rounded">토큰 비우기</button>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={connect} className="px-3 py-1 text-sm bg-green-600 text-white rounded" disabled={isConnected}>연결</button>
              <button onClick={disconnect} className="px-3 py-1 text-sm bg-red-600 text-white rounded" disabled={!isConnected}>해제</button>
              <span className={`px-2 py-1 text-xs rounded ${isConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{isConnected ? "연결됨" : "끊김"}</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded shadow space-y-3">
            <h2 className="font-semibold">구독 설정</h2>
            <label className="text-sm text-gray-600">Destination</label>
            <input className="w-full border rounded px-2 py-1" value={destination} onChange={(e) => setDestination(e.target.value)} />

            <div className="flex gap-2 pt-2">
              <button onClick={subscribe} className="px-3 py-1 text-sm bg-blue-600 text-white rounded" disabled={!isConnected || isSubscribed}>구독</button>
              <button onClick={unsubscribe} className="px-3 py-1 text-sm bg-gray-600 text-white rounded" disabled={!isSubscribed}>구독해지</button>
              <span className={`px-2 py-1 text-xs rounded ${isSubscribed ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{isSubscribed ? "구독중" : "미구독"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">로그</h2>
            <button onClick={() => setLogs([])} className="px-3 py-1 text-sm bg-gray-200 rounded">지우기</button>
          </div>
          <div className="text-xs font-mono whitespace-pre-wrap break-words max-h-[50vh] overflow-auto border rounded p-2 bg-gray-50">
            {logs.length === 0 ? <div className="text-gray-400">로그가 없습니다.</div> : logs.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          참고: 이 페이지는 전역 WebSocketProvider를 사용하지 않고 독립적으로 SockJS/STOMP를 사용합니다. (CONNECT/SUBSCRIBE 헤더를 개별 제어)
        </div>
      </div>
    </div>
  );
}

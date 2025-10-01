import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WebSocketComponent = () => {
    // Stomp 클라이언트 인스턴스를 저장하기 위해 ref를 사용합니다.
    const clientRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    // JWT 토큰 (실제로는 로그인 후 LocalStorage, Redux 등에서 가져와야 합니다)
    const JWT_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbjJAdGVzdC5jb20iLCJ1c2VySWQiOjIsIm9wZXJhdG9ySWQiOjIsInJvbGVzIjpbIlJPTEVfQURNSU4iXSwiaWF0IjoxNzU4OTc5NDcyLCJleHAiOjE3NTkwNjU4NzJ9.xNlN0Rlr8kHp0KNMjGwCJT05I1GpWTzL5R2DUChBhtyCjTFo7ggQSmu--LgvuYv_bCkp1-hXDQsYbcHylSlAaw";

    useEffect(() => {
        // 컴포넌트가 언마운트될 때 연결을 해제합니다.
        return () => {
            disconnect();
        };
    }, []);

    const connect = () => {
        // 이미 연결되어 있거나 연결 중이면 중복 실행을 방지합니다.
        if (clientRef.current) {
            console.log('Already connected or connecting.');
            return;
        }

        // 1. Stomp 클라이언트 생성
        const client = new Client({
            // SockJS를 웹소켓 생성자로 제공합니다.
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            // 연결 헤더에 인증 토큰을 추가합니다.
            connectHeaders: {
                Authorization: `Bearer ${JWT_TOKEN}`,
            },
            // 연결 성공 시 콜백
            onConnect: (frame) => {
                console.log('Connected: ' + frame);
                setIsConnected(true);

                

            },
            // 연결 에러 발생 시 콜백
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            // 재연결 딜레이 (ms)
            reconnectDelay: 5000,
            // 디버그 메시지 로깅
            debug: (str) => {
                console.log(new Date(), str);
            },
        });

        // 3. 클라이언트 활성화
        client.activate();
        // ref에 클라이언트 인스턴스 저장
        clientRef.current = client;
    };

    const disconnect = () => {
        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
            setIsConnected(false);
            setMessages([]);
            console.log('Disconnected.');
        }
    };

    const sendMessage = () => {
        if (clientRef.current && isConnected) {
            // 4. 메시지 전송 (예시: DRIVER 역할만 가능한 경로)
            clientRef.current.publish({
                destination: '/app/drive-events',
                body: JSON.stringify({
                    dispatchId: 1,
                    eventType: 'BRAKING',
                    eventTimestamp: '2025-09-23T13:12:47.682512'
                }),
                headers: { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JWT_TOKEN}`
                 },
            });
        }
    };

    return (
        <div>
            <h2>WebSocket Connection</h2>
            <div>
                <button onClick={connect} disabled={isConnected}>Connect</button>
                <button onClick={disconnect} disabled={!isConnected}>Disconnect</button>
            </div>
            {isConnected && <button onClick={sendMessage}>Send Drive Event (DRIVER only)</button>}
            <h3>Status: {isConnected ? 'Connected' : 'Disconnected'}</h3>
            <div>
                <h4>Received Messages:</h4>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default WebSocketComponent;
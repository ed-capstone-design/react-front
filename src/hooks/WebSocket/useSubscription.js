import { useEffect, useRef } from "react";
import { webSocketBroker } from "../../WebSocket/WebSocketBroker";

export const useSubscription = (topic, callback) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!topic) return;
    const handleMessage = (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };
    webSocketBroker.subscribe(topic, handleMessage);
    return () => {
      webSocketBroker.unsubscribe(topic, handleMessage);
    };
  }, [topic]);
};

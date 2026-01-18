//종류

import { useState, useCallback } from "react";
import { useSubscription } from "./useSubscription";

//알림-전역->프로바이더로 제공

export const useWebSocketNotification = (callback) => {
  const topic = `/user/queue/notifications`;
  const memoizedCallback = useCallback((data) => callback?.(data), [callback]);
  useSubscription(topic, memoizedCallback);
};
//위치
export const useWebSocketLocation = (dispatchId) => {
  const [location, setLocation] = useState(null);
  const topic = dispatchId ? `/topic/dispatch/${dispatchId}/location` : null;

  useSubscription(topic, (data) => {
    setLocation(data);
  });
  return location;
};

//OBD

export const useWebSocketOBD = (dispatchId) => {
  const [obdData, setObdData] = useState({
    dispatchId: null,
    stalled: false,
    soc: 0,
    engineRpm: 0,
    torque: 0,
    brake: 0,
    throttle: 0,
    clutch: 0,
  });
  const topic = dispatchId ? `/topic/dispatch/${dispatchId}/obd` : null;
  useSubscription(topic, (data) => setObdData(data));

  return obdData;
};

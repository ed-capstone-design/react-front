import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { dispatchService } from "../../api/ServiceLayer/dispatchService";

export const DISPATCH_KEYS = {
  all: ["dispatch"],
  list: (filters) => [...DISPATCH_KEYS.all, "list", filters],
  detail: (id) => [...DISPATCH_KEYS.all, "detail", id],
  record: (id) => [...DISPATCH_KEYS.all, "record", id],
  events: (id) => [...DISPATCH_KEYS.all, "events", id],
  path: (id) => [...DISPATCH_KEYS.all, "path", id],
};

// 배차 목록 조회 (필터 포함)
export const useDispatchList = (startDate, endDate, status) => {
  return useQuery({
    queryKey: DISPATCH_KEYS.list({ startDate, endDate, status }),
    queryFn: () => dispatchService.getDispatches(startDate, endDate, status),
    placeholderData: keepPreviousData, // 깜빡임 방지
  });
};

// 배차 상세 조회
export const useDispatchDetail = (dispatchId) => {
  return useQuery({
    queryKey: DISPATCH_KEYS.detail(dispatchId),
    queryFn: () => dispatchService.getDispatchDetail(dispatchId),
    enabled: !!dispatchId,
  });
};

// 운행 기록(통계) 조회
export const useDispatchRecord = (dispatchId) => {
  return useQuery({
    queryKey: DISPATCH_KEYS.record(dispatchId),
    queryFn: () => dispatchService.getDispatchRecord(dispatchId),
    enabled: !!dispatchId,
  });
};
//배차 생성
export const useCreateDispatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dispatchService.createDispatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISPATCH_KEYS.all });
    },
  });
};
//배차 수동 시작
export const useStartDispatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dispatchService.startDispatch,
    onSuccess: (data, dispatchId) => {
      queryClient.invalidateQueries({
        queryKey: DISPATCH_KEYS.detail(dispatchId),
      });
      queryClient.invalidateQueries({ queryKey: DISPATCH_KEYS.list() }); // 상태 변경되므로 목록도 갱신
    },
  });
};
//배차 수동 종료
export const useCompleteDispatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dispatchService.completeDispatch,
    onSuccess: (data, dispatchId) => {
      queryClient.invalidateQueries({
        queryKey: DISPATCH_KEYS.detail(dispatchId),
      });
      queryClient.invalidateQueries({ queryKey: DISPATCH_KEYS.list() });
    },
  });
};
//배차 취소
export const useCancelDispatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dispatchService.cancelDispatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISPATCH_KEYS.list() });
    },
  });
};

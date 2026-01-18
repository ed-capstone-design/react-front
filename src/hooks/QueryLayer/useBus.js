import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { busService } from "../../api/ServiceLayer/busService";

export const BUS_KEYS = {
  all: ["bus"],
  list: () => [...BUS_KEYS.all, "list"],
  detail: (id) => [...BUS_KEYS.all, "detail", id],
};

export const useBusList = () => {
  return useQuery({
    queryKey: BUS_KEYS.list(),
    queryFn: busService.getBuses,
    staleTime: 1000 * 60 * 5, // 5분
  });
};

export const useBusDetail = (busId) => {
  return useQuery({
    queryKey: BUS_KEYS.detail(busId),
    queryFn: () => busService.getBusDetail(busId),
    enabled: !!busId,
  });
};

export const useCreateBus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: busService.createNewBus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUS_KEYS.list() });
    },
  });
};

export const useUpdateBus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ busId, busData }) => busService.updateBus(busId, busData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: BUS_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: BUS_KEYS.detail(variables.busId),
      });
    },
  });
};

export const useDeleteBus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: busService.deleteBus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUS_KEYS.list() });
    },
  });
};

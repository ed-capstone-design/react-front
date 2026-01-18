import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { driverService } from "../../api/ServiceLayer/driverService";

export const DRIVER_KEYS = {
  all: ["driver"],
  list: () => [...DRIVER_KEYS.all, "list"],
  detail: (id) => [...DRIVER_KEYS.all, "detail", id],
  dispatches: (id, filters) => [...DRIVER_KEYS.all, "dispatches", id, filters],
};

export const useDriverList = () => {
  return useQuery({
    queryKey: DRIVER_KEYS.list(),
    queryFn: driverService.getAllDrivers,
  });
};

export const useDriverDetail = (driverId) => {
  return useQuery({
    queryKey: DRIVER_KEYS.detail(driverId),
    queryFn: () => driverService.getDriver(driverId),
    enabled: !!driverId,
  });
};

export const useDriverDispatches = (driverId, startDate, endDate) => {
  return useQuery({
    queryKey: DRIVER_KEYS.dispatches(driverId, { startDate, endDate }),
    queryFn: () =>
      driverService.getDriverDispatch(driverId, startDate, endDate),
    enabled: !!driverId && !!startDate && !!endDate,
  });
};

// --- Mutations ---

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, updateData }) =>
      driverService.updateDriverInfo(driverId, updateData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: DRIVER_KEYS.detail(variables.driverId),
      });
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.list() });
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: driverService.deleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.list() });
    },
  });
};

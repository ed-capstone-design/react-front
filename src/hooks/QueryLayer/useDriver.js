import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { driverService } from "../../api/ServiceLayer/driverService";
import { dispatchService } from "../../api/ServiceLayer/dispatchService";
export const DRIVER_KEYS = {
  all: ["driver"],
  list: (filters) =>
    filters
      ? [...DRIVER_KEYS.all, "list", filters]
      : [...DRIVER_KEYS.all, "list"],
  detail: (id) => [...DRIVER_KEYS.all, "detail", id],
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
export const useAvailableDrivers = (startDate, endDate) => {
  return useQuery({
    queryKey: DRIVER_KEYS.list({ startDate, endDate }),
    queryFn: () => dispatchService.getAvailableDrivers(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

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

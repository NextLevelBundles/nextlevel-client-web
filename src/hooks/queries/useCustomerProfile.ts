import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerProfileApi } from "@/lib/api";
import {
  CustomerProfile,
  UpdateCustomerProfileRequest,
} from "@/lib/api/types/customer-profile";
import { useAuth } from "@/shared/providers/auth-provider";

export const customerProfileQueryKey = ["customer-profile"] as const;

export function useCustomerProfile() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: customerProfileQueryKey,
    queryFn: (): Promise<CustomerProfile> =>
      customerProfileApi.getCustomerProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export const customerProfileByHandleQueryKey = (handle: string) =>
  ["customer-profile", handle] as const;

export function useCustomerProfileByHandle(handle: string) {
  return useQuery({
    queryKey: customerProfileByHandleQueryKey(handle),
    queryFn: (): Promise<CustomerProfile> =>
      customerProfileApi.getCustomerProfileByHandle(handle),
    enabled: !!handle,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCustomerProfileRequest) =>
      customerProfileApi.updateCustomerProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerProfileQueryKey });
    },
  });
}

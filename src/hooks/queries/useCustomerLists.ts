import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerProfileApi } from "@/lib/api";
import { CustomerList, CreateCustomerListRequest } from "@/lib/api/types/customer-profile";
import { useAuth } from "@/shared/providers/auth-provider";

export const customerListsQueryKey = ["customer-lists"] as const;

export function useCustomerLists() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: customerListsQueryKey,
    queryFn: (): Promise<CustomerList[]> => customerProfileApi.getLists(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCreateCustomerList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerListRequest) =>
      customerProfileApi.createList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerListsQueryKey });
    },
  });
}

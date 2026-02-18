import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerProfileApi } from "@/lib/api";
import {
  CustomerGame,
  UnimportedSteamGame,
  PaginatedResponse,
  ImportGamesRequest,
  UpdateCollectionGameStatusRequest,
  SetGamesRemovedRequest,
} from "@/lib/api/types/customer-profile";
import { useAuth } from "@/shared/providers/auth-provider";

export const customerCollectionQueryKey = ["customer-collection"] as const;
export const collectionPagedQueryKey = ["collection-paged"] as const;
export const unimportedGamesQueryKey = ["unimported-games"] as const;

export function useCustomerCollection() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: customerCollectionQueryKey,
    queryFn: (): Promise<CustomerGame[]> =>
      customerProfileApi.getCollection(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCollectionPaged(params?: {
  search?: string;
  playStatus?: string;
  page?: number;
  pageSize?: number;
}) {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: [...collectionPagedQueryKey, params],
    queryFn: (): Promise<PaginatedResponse<CustomerGame>> =>
      customerProfileApi.getCollectionPaged(params),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useUnimportedGames(params?: {
  search?: string;
  playtimeFilter?: string;
  page?: number;
  pageSize?: number;
  isRemoved?: boolean;
}) {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: [...unimportedGamesQueryKey, params],
    queryFn: (): Promise<PaginatedResponse<UnimportedSteamGame>> =>
      customerProfileApi.getUnimportedGames(params),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useImportGames() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ImportGamesRequest) =>
      customerProfileApi.importGames(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerCollectionQueryKey });
      queryClient.invalidateQueries({ queryKey: unimportedGamesQueryKey });
    },
  });
}

export function useRemoveFromCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerProfileApi.removeFromCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerCollectionQueryKey });
      queryClient.invalidateQueries({ queryKey: collectionPagedQueryKey });
    },
  });
}

export function useUpdateCollectionGameStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      id: string;
      data: UpdateCollectionGameStatusRequest;
    }) => customerProfileApi.updateCollectionGameStatus(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerCollectionQueryKey });
      queryClient.invalidateQueries({ queryKey: collectionPagedQueryKey });
    },
  });
}

export function useSetGamesRemoved() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetGamesRemovedRequest) =>
      customerProfileApi.setGamesRemoved(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unimportedGamesQueryKey });
    },
  });
}

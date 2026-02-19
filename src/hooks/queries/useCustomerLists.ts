import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerProfileApi } from "@/lib/api";
import {
  CustomerList,
  CustomerListDetail,
  GameSearchResult,
  CreateCustomerListRequest,
  UpdateCustomerListRequest,
  AddListItemRequest,
} from "@/lib/api/types/customer-profile";
import { useAuth } from "@/shared/providers/auth-provider";

export const customerWishlistQueryKey = ["customer-wishlist"] as const;
export const customerListsQueryKey = ["customer-lists"] as const;
export const customerListDetailQueryKey = (listId: string) =>
  ["customer-list-detail", listId] as const;
const customerListsByHandleQueryKey = (handle: string) =>
  ["customer-lists", "by-handle", handle] as const;
const customerListDetailByHandleQueryKey = (handle: string, listId: string) =>
  ["customer-list-detail", "by-handle", handle, listId] as const;
const customerWishlistByHandleQueryKey = (handle: string) =>
  ["customer-wishlist", "by-handle", handle] as const;
export const gameSearchQueryKey = (query: string) =>
  ["game-search", query] as const;

export function useCustomerLists(handle?: string) {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: handle
      ? customerListsByHandleQueryKey(handle)
      : customerListsQueryKey,
    queryFn: (): Promise<CustomerList[]> =>
      handle
        ? customerProfileApi.getListsByHandle(handle)
        : customerProfileApi.getLists(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCustomerListDetail(listId: string, handle?: string) {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: handle
      ? customerListDetailByHandleQueryKey(handle, listId)
      : customerListDetailQueryKey(listId),
    queryFn: () =>
      handle
        ? customerProfileApi.getListDetailByHandle(handle, listId)
        : customerProfileApi.getListDetail(listId),
    enabled: isAuthenticated && !!listId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useGameSearch(query: string) {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: gameSearchQueryKey(query),
    queryFn: (): Promise<GameSearchResult[]> =>
      customerProfileApi.searchGames(query),
    enabled: isAuthenticated && query.length >= 2,
    staleTime: 30 * 1000,
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

export function useUpdateCustomerList(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCustomerListRequest) =>
      customerProfileApi.updateList(listId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerListsQueryKey });
      queryClient.invalidateQueries({
        queryKey: customerListDetailQueryKey(listId),
      });
    },
  });
}

export function useDeleteCustomerList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listId: string) => customerProfileApi.deleteList(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerListsQueryKey });
    },
  });
}

export function useAddListItem(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddListItemRequest) =>
      customerProfileApi.addItem(listId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerListDetailQueryKey(listId),
      });
      queryClient.invalidateQueries({ queryKey: customerListsQueryKey });
    },
  });
}

export function useRemoveListItem(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      customerProfileApi.removeItem(listId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerListDetailQueryKey(listId),
      });
      queryClient.invalidateQueries({ queryKey: customerListsQueryKey });
    },
  });
}

export function useWishlist(handle?: string) {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: handle
      ? customerWishlistByHandleQueryKey(handle)
      : customerWishlistQueryKey,
    queryFn: () =>
      handle
        ? customerProfileApi.getWishlistByHandle(handle)
        : customerProfileApi.getWishlist(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddListItemRequest) =>
      customerProfileApi.addToWishlist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerWishlistQueryKey });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      customerProfileApi.removeFromWishlist(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerWishlistQueryKey });
    },
  });
}

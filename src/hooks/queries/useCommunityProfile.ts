import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerProfileApi } from "@/lib/api";
import {
  CommunityProfile,
  UpdateCommunityProfileRequest,
} from "@/lib/api/types/customer-profile";
import { useAuth } from "@/shared/providers/auth-provider";

export const communityProfileQueryKey = ["community-profile"] as const;

export function useCommunityProfile() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: communityProfileQueryKey,
    queryFn: (): Promise<CommunityProfile> =>
      customerProfileApi.getCommunityProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export const communityProfileByHandleQueryKey = (handle: string) =>
  ["community-profile", handle] as const;

export function useCommunityProfileByHandle(handle: string) {
  return useQuery({
    queryKey: communityProfileByHandleQueryKey(handle),
    queryFn: (): Promise<CommunityProfile | null> =>
      customerProfileApi.getCommunityProfileByHandle(handle),
    enabled: !!handle,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useUpdateCommunityProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCommunityProfileRequest) =>
      customerProfileApi.updateCommunityProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityProfileQueryKey });
    },
  });
}

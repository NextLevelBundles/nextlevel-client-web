import { useQuery } from "@tanstack/react-query";
import { gameApi } from "@/lib/api";
import { GameDetail } from "@/lib/api/types/game";

export const gameDetailQueryKey = (slug: string) =>
  ["game-detail", slug] as const;

export function useGameDetail(slug: string | undefined) {
  return useQuery({
    queryKey: gameDetailQueryKey(slug ?? ""),
    queryFn: (): Promise<GameDetail | null> => gameApi.getBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

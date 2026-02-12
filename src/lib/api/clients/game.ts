import { ClientApi } from "../client-api";
import { GameDetail } from "../types/game";

export class GameApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async getBySlug(slug: string): Promise<GameDetail | null> {
    try {
      return await this.client.get<GameDetail>(
        `/games/${encodeURIComponent(slug)}`
      );
    } catch {
      return null;
    }
  }
}

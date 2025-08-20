import { ClientApi } from "../client-api";

export interface Country {
  id: string;
  name: string;
  flag: string;
}

export class CommonClient {
  constructor(private api: ClientApi) {}

  async getCountries(): Promise<Country[]> {
    return this.api.get<Country[]>('/common/countries');
  }
}
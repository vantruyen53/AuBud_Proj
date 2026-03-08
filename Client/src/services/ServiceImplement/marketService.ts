import { IMarketService } from "@/src/models/interface/ServiceInterface";
import { IMarketDataResponse } from "@/src/models/interface/Entities";
import { UserDTO } from "@/src/models/interface/DTO";
import { API_URL } from "@/src/constants/securityContants";
import { apiFetch } from "../auth/apiService";

export class MarketService implements IMarketService {
  constructor(private user: UserDTO) {}

  async getMarketData(): Promise<IMarketDataResponse | null> {
    try {
          // đổi fetch → apiFetch, bỏ headers
          const res = await apiFetch(`/aubud/api/v1/market`);

          if (!res.ok) return null;

          const json = await res.json();
          return json ?? null;
      } catch (error) {
          console.error('getMarketData error:', error);
          return null;
      }
  }
}
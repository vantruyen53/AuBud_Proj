import { ServerResult } from "../../entities/appEntities.js";

export interface ITokenRepository {
    saveToken(id: string, tokenHash: string, userId: string, expiresAt: Date, deviceInfo: string): Promise<void>;
    deleteToken(tokenHash: string): Promise<ServerResult>;
    findByHash(tokenHash: string): Promise<any | null>;
    findLastDeviceByUserId(userId: string): Promise<string | null>;
    updatePushToken(userId: string, deviceInfo: string, pushToken: string): Promise<void>;
    getPushTokensByUserId(userId: string): Promise<string[]>
    upsertToken(id: string,tokenHash: string,userId: string,expiresAt: Date,deviceInfo: string,): Promise<void>
}
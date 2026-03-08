// domain/repositories/ITransactionRepository.ts
import type{ ITransaction, ServerResult } from "../../../entities/appEntities.js";
import type{ CreateTransactionDTO, UpdateTransactionDTO, TransactionQueryDTO } from "../../../../data/DTO/AppDTO.js";

export interface ITransactionRepository {
  create(userId: string, data: CreateTransactionDTO,newEncryptedBalance: string): Promise<ServerResult>;
  update(userId: string, data: UpdateTransactionDTO): Promise<ServerResult>;
  delete(userId: string, id: string, newBackupBalance:string): Promise<ServerResult>;
  
  // Hàm tìm kiếm linh hoạt dựa trên query params
  find(userId: string, query: TransactionQueryDTO): Promise<ITransaction[]>;
  getMonthlySpendingSummary(userId: string,day: number,month: number,year: number): 
  Promise<{ currentPeriod: any[]; lastPeriod: any[] }>
}
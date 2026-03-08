// application/services/TransactionService.ts
import type{ ITransactionRepository } from "../../domain/models/application/repository/ITransactionRepo.js";
import UserRepository from "../../data/repositories/auth/UserRepositoryImpl.js";

export class TransactionService {
  constructor(private transactionRepo: ITransactionRepository,
    private userRepo: UserRepository
  ) {}

  async getTransactions(userId: string, query: any) {
    const role = await this.userRepo.checkUserRole(userId);
    if (role !== 'user') {
        throw new Error("Unauthorized: Only users can access transactions");
    }
    return await this.transactionRepo.find(userId, query);
  }

  async  getMonthlySpendingSummary(userId: string,day: number,month: number,year: number){
    return await this.transactionRepo.getMonthlySpendingSummary(userId, day, month, year)
  }

  async addTransaction(userId: string, data: any, newEncryptedBalance: string) {
    // Ví dụ logic: Kiểm tra số dư ví hoặc tổng ngân sách đã chi trước  khi cho phép chi tiêu (nếu cần)
    return await this.transactionRepo.create(userId, data,newEncryptedBalance);
  }

  async updateTransaction(userId: string, data: any){
    return await this.transactionRepo.update(userId, data)
  }

  async removeTransaction(userId: string, id: string, newBackupBalance:string) {
    return await this.transactionRepo.delete(userId, id, newBackupBalance);
  }
}
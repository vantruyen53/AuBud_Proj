// application/chatApp.ts
import { ChatBotService } from "@/src/services/chatService";
import { IMessage, UserDTO, CreateTransactionDTO, WalletDTO } from "@/src/models/interface/DTO";
import { TransactionApp } from "./TransactionApp";
import { WalletApp } from "./WalletApp";
import { dateTimeStr } from "@/src/utils/format";

interface Result {
  status: boolean;
  message: string;
  reply?: string;
}

export class ChatBotApp {
  private _service: ChatBotService;
  private _transactionApp: TransactionApp;
  private _walletApp: WalletApp;
  private user:UserDTO
  private wallets: any[];

  constructor(user: UserDTO, wallets: any[]) {
    this._service = new ChatBotService();
    this._transactionApp = new TransactionApp(user);
    this._walletApp = new WalletApp(user);
    this.user = user;
    this.wallets = wallets;
  }

  async post(mess: IMessage, context?: string, depth: number = 0): Promise<Result> {
    if (mess.text.length > 500)
      return { status: false, message: 'Tin nhắn không được vượt quá 500 ký tự' };

    const res = await this._service.post(mess.text, this.wallets, context);
    if (!res) return { status: false, message: 'Không nhận được phản hồi' };

    if (res.type === 'advice' || res.type === 'reply') {
      return { status: true, message: 'OK', reply: res.message };
    }

    if (res.type === 'command' && res.command) {
      return await this.handleCommand(res.command, mess, res.message, depth);
    }

    return { status: false, message: 'Phản hồi không hợp lệ' };
  }

  // ─── xử lý từng loại command ──────────────────────────────────────────────

  private async handleCommand(
    command: { function: string; dto: Record<string, any> },
    originalMess: IMessage,
    geminiMessage: string, depth = 0
  ): Promise<Result> {
    switch (command.function) {
      case 'create_transaction':
        return await this.handleCreateTransaction(command.dto, geminiMessage);
      case 'update_transaction':
        return await this.handleUpdateTransaction(command.dto, geminiMessage);
      case 'delete_transaction':
        return await this.handleDeleteTransaction(command.dto, geminiMessage);
      case 'get_transactions':
        return await this.handleGetTransactions(command.dto, originalMess, depth);
      case 'create_wallet':
        return await this.handleCreateWallet(command.dto, geminiMessage);
      case 'update_wallet':
        return await this.handleUpdateWallet(command.dto, geminiMessage);
      default:
        return { status: false, message: 'Tính năng chưa được hỗ trợ' };
    }
  }

   // ─── create transaction ───────────────────────────────────────────────────
   private async handleCreateTransaction(
    dto: Record<string, any>,
    geminiMessage: string,
  ): Promise<Result> {
    if (!dto.wallet_id || !dto.category_id || !dto.amount || !dto.type) {
      return { status: true, message: 'OK', reply: geminiMessage };
    }
    
    const wallet = this.wallets.find(w => w.id === dto.wallet_id);

    if (!wallet)
      return { status: false, message: 'Không tìm thấy ví, vui lòng thử lại' };

    const amount = Number(dto.amount);
    const currentBalance = Number(wallet.balance);

    if (dto.type === 'sending' && currentBalance < amount)
      return { status: true, message: 'OK', reply: 'Số dư ví không đủ để thực hiện giao dịch này.' };

    const createdAt = dateTimeStr();
    // truyền plain data — TransactionApp tự mã hoá
    const payload: CreateTransactionDTO = {
      categoryId: dto.category_id,
      amount: amount,             // number, không phải string
      type: dto.type,
      walletId: dto.wallet_id,
      createdAt: createdAt,
      note: dto.note ?? '',
      title: dto.title,
      budgetId: dto.budget_id ?? undefined,
      status:'completed',
      userId: this.user.id,
    };

    // addTransaction(payLoad, walletBalance) — truyền balance hiện tại, app tự tính
    const result = await this._transactionApp.addTransaction(payload, currentBalance, 'bot');
    if (!result)
      return { status: false, message: 'Tạo giao dịch thất bại, vui lòng thử lại' };

    // cập nhật balance trong context
    wallet.balance = dto.type === 'sending'
      ? currentBalance - amount
      : currentBalance + amount;

    return { status: true, message: 'OK', reply: geminiMessage };
  }

  // ─── update transaction ───────────────────────────────────────────────────
  private async handleUpdateTransaction(
    dto: Record<string, any>,
    geminiMessage: string,
  ): Promise<Result> {
    const oldWallet = this.wallets.find(w => w.id === dto.old_wallet_id);
    const newWallet = this.wallets.find(w => w.id === (dto.new_wallet_id ?? dto.old_wallet_id));
    if (!oldWallet || !newWallet)
      return { status: false, message: 'Không tìm thấy ví, vui lòng thử lại' };

    // fallback type nếu Gemini không trả về
    const newType = dto.type ?? dto.old_type;
    const isSameWallet = dto.old_wallet_id === (dto.new_wallet_id ?? dto.old_wallet_id);

    // bước 1 — hoàn tác giao dịch cũ trên ví cũ
    const restoredOldBalance = dto.old_type === 'income'
      ? Number(oldWallet.balance) - Number(dto.old_amount)
      : Number(oldWallet.balance) + Number(dto.old_amount);

    // bước 2 — áp dụng giao dịch mới
    // nếu cùng ví → tính từ restoredOldBalance
    // nếu khác ví → tính từ balance hiện tại của ví mới
    const baseBalance = isSameWallet ? restoredOldBalance : Number(newWallet.balance);
    const newBalance = newType === 'income'
      ? baseBalance + Number(dto.new_amount)
      : baseBalance - Number(dto.new_amount);

    const payload = {
      id: dto.id,
      categoryId: dto.category_id,
      amount: Number(dto.new_amount),
      type: newType,  // ← dùng newType thay vì dto.type
      walletId: dto.new_wallet_id ?? dto.old_wallet_id,
      createdAt: dto.created_at,
      note: dto.note ?? '',
      title: dto.title,
    };

    const oldWalletPayload = { oldBalance: restoredOldBalance, oldWalletId: oldWallet.id };
    const newWalletPayload = { newBalance: newBalance, newWalletId: newWallet.id };

    const result = await this._transactionApp.updateTransaction(
      payload,
      oldWalletPayload,
      newWalletPayload,
    );

    if (!result)
      return { status: false, message: 'Cập nhật giao dịch thất bại, vui lòng thử lại' };

    oldWallet.balance = restoredOldBalance;
    newWallet.balance = newBalance;

    return { status: true, message: 'OK', reply: geminiMessage };
  }

  // ─── delete transaction ───────────────────────────────────────────────────
  private async handleDeleteTransaction(
    dto: Record<string, any>,
    geminiMessage: string,
  ): Promise<Result> {
    // truyền đúng ITransactionItem — app tự lo phần còn lại
    const transaction = {
      id: dto.id,
      walletId: dto.wallet_id,
      amount: Number(dto.amount),
      type: dto.type,
      title: dto.title,
      categoryId: dto.category_id,
    };

    const result = await this._transactionApp.deleteTransaction(transaction as any);
    if (!result)
      return { status: false, message: 'Xoá giao dịch thất bại, vui lòng thử lại' };

    // cập nhật context
    const wallet = this.wallets.find(w => w.id === dto.wallet_id);
    if (wallet) {
      wallet.balance = dto.type === 'sending'
        ? Number(wallet.balance) + Number(dto.amount)
        : Number(wallet.balance) - Number(dto.amount);
    }

    return { status: true, message: 'OK', reply: geminiMessage };
  }

  // ─── get transactions  ─────────────────────────────
  private async handleGetTransactions(
    dto: Record<string, any>,
    originalMess: IMessage,
    depth: number = 0,
  ): Promise<Result> {

    if (depth >= 1) {
      return {
        status: true,
        message: 'OK',
        reply: 'Không tìm thấy giao dịch nào phù hợp. Bạn có thể kiểm tra lại thông tin không ạ?',
      };
    }

    // getTransactionHistory(date, month, year, since) — app tự giải mã
    const since = dto.day ? 'day' : dto.month ? 'month' : 'year';
    const data = await this._transactionApp.getTransactionHistory(
      Number(dto.day ?? 0),
      Number(dto.month ?? 0),
      Number(dto.year),
      since,
    );

    if (!data || data.rawTransactions.length === 0) {
      return {
        status: true,
        message: 'OK',
        reply: 'Không tìm thấy giao dịch nào phù hợp trong khoảng thời gian này.',
      };
    }

    // tổng hợp thành plain text summary gửi lên Gemini lần 2
    const summary = [
      `Tổng chi: ${data.totalSending}đ`,
      `Tổng thu: ${data.totalIncome}đ`,
      `Số dư: ${data.balance}đ`,
      `Chi tiết:`,
      ...data.rawTransactions.map(t =>
        `- ID: ${t.id} | Title: ${t.title} | Amount: ${t.amount}đ | Type: ${t.type} | Date: ${t.date} | Category: ${t.category?.name ?? ''} | WalletId: ${t.walletId ?? ''}`
      ),
    ].join('\n');

    return await this.post(originalMess, summary);
  }

  // ─── create wallet ────────────────────────────────────────────────────────
  private async handleCreateWallet(
    dto: Record<string, any>,
    geminiMessage: string,
  ): Promise<Result> {
    const createdAt = dateTimeStr()
    const payload:WalletDTO = {
      name: dto.name,
      balance: Number(dto.balance ?? 0),
      createdAt: createdAt,
      status: 'active' as const,
      actionType: 'wallet' as const,
      userId:this.user.id,
    };

    const result = await this._walletApp.createNewWallet(payload);
    if (!result)
      return { status: false, message: 'Tạo ví thất bại, vui lòng thử lại' };

    return { status: true, message: 'OK', reply: geminiMessage };
  }

  // ─── update wallet ────────────────────────────────────────────────────────
  private async handleUpdateWallet(
    dto: Record<string, any>,
    geminiMessage: string,
  ): Promise<Result> {
    const wallet = this.wallets.find(w => w.id === dto.wallet_id);
    if (!wallet)
      return { status: false, message: 'Không tìm thấy ví, vui lòng thử lại' };

    const now = new Date();
    const createdAt = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    const payload:WalletDTO  = {
      id: dto.wallet_id,
      name: dto.name ?? wallet.name,
      balance: Number(dto.balance ?? wallet.balance),
      createdAt: createdAt,
      status: 'active' as const,
      actionType: 'wallet' as const,
      userId:this.user.id
    };
    const result = await this._walletApp.updateWallet(payload);
    if (!result)
      return { status: false, message: 'Cập nhật ví thất bại, vui lòng thử lại' };

    wallet.name = payload.name;
    wallet.balance = payload.balance;

    return { status: true, message: 'OK', reply: geminiMessage };
  }
}
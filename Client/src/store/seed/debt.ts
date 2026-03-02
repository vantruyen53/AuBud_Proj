import { IDebtMaster, IDebtTransaction } from "@/src/models/IApp";
export const mockDebts: IDebtMaster[] = [
  {
    id: 'debt_001',
    partnerName: 'Nguyen Van A',
    type: 'loan_to',
    totalAmount: 700000,
    remaining: 700000,
    status: 'active',
    createAt: '2026-02-01',
  },
  {
    id: 'debt_002', // Gốc là khoản cho bạn A vay
    partnerName: 'Tran Thi B',
    type: 'loan_to',
    totalAmount: 1500000, // 1.000.000 (cũ) + 500.000 (mượn thêm)
    remaining: 1100000,   // Sau khi A trả 400k và mượn thêm 500k
    status: 'active',
    createAt: '2026-02-01',
  },
  {
    id: 'debt_005',
    partnerName: 'Old Sister',
    type: 'loan_from',
    totalAmount: 2000000,
    remaining: 1000000,
    status: 'closed',
    createAt: '2026-02-12',
  },
];

export const mockDebtTransactions: IDebtTransaction[] = [
  // Transactions for Bạn B
  { id: 'tx_001', debtId: 'debt_001', type: 'loan_to', amount: 700000, createAt: '2026-02-01', note: 'Lend for electricity bill' },
  
  // Transactions for Bạn A
  { id: 'tx_002', debtId: 'debt_002', type: 'loan_to', amount: 1000000, createAt: '2026-02-01', note: 'Lend for electricity bill' },
  { id: 'tx_003', debtId: 'debt_002', type: 'repay_from', amount: 400000, createAt: '2026-02-05', note: 'Partial repayment' },
  { id: 'tx_004', debtId: 'debt_002', type: 'loan_to', amount: 500000, createAt: '2026-02-10', note: 'Additional loan for wedding' },

  // Transactions with พี่
  { id: 'tx_005', debtId: 'debt_005', type: 'loan_from', amount: 2000000, createAt: '2026-02-12', note: 'Borrow for house rent' },
  { id: 'tx_006', debtId: 'debt_005', type: 'repay_to', amount: 1000000, createAt: '2026-02-15', note: 'Full repayment' },
];
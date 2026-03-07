import { IGroupTransaction } from "../../models/IApp";

// Seed lịch sử giao dịch quỹ nhóm
const mockGroupTransactions: IGroupTransaction[] = [
  // Family Fund (fundId: '1')
  { id: 't1', fundId: '1', type: 'contribute', amount: 5000000, memberName: 'Nguyễn Văn An', date: '2024-03-05', note: 'Đóng quỹ tháng 3' },
  { id: 't2', fundId: '1', type: 'contribute', amount: 5000000, memberName: 'Trần Thị Bình', date: '2024-03-05', note: 'Đóng quỹ tháng 3' },
  { id: 't3', fundId: '1', type: 'withdraw', amount: 2000000, memberName: 'Lê Minh Cường', date: '2024-03-10', note: 'Chi tiêu gia đình' },
  { id: 't4', fundId: '1', type: 'contribute', amount: 3000000, memberName: 'Phạm Thu Hà', date: '2024-03-12', note: 'Đóng bổ sung' },

  // Party Fund (fundId: '2')
  { id: 't5', fundId: '2', type: 'contribute', amount: 100000, memberName: 'Phạm Xuân Cuy', date: '2024-03-05' },
  { id: 't6', fundId: '2', type: 'withdraw', amount: 50000, memberName: 'Phạm Xuân Cuy', date: '2024-03-04', note: 'Mua đồ ăn' },
  { id: 't7', fundId: '2', type: 'contribute', amount: 200000, memberName: 'Hoàng Minh Đức', date: '2024-03-06' },
];

export default mockGroupTransactions;

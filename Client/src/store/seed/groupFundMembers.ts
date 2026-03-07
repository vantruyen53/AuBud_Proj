import { IGroupMember } from "../../models/IApp";

// Seed members cho các quỹ nhóm
const mockGroupMembers: IGroupMember[] = [
  // Family Fund (fundId: '1')
  { id: 'm1', fundId: '1', name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', role: 'admin', joinedAt: '2024-01-01' },
  { id: 'm2', fundId: '1', name: 'Trần Thị Bình', email: 'binh.tran@gmail.com', role: 'member', joinedAt: '2024-01-02' },
  { id: 'm3', fundId: '1', name: 'Lê Minh Cường', email: 'cuong.le@gmail.com', role: 'member', joinedAt: '2024-01-05' },
  { id: 'm4', fundId: '1', name: 'Phạm Thu Hà', email: 'ha.pham@gmail.com', role: 'member', joinedAt: '2024-01-10' },

  // Party Fund (fundId: '2')
  { id: 'm5', fundId: '2', name: 'Phạm Xuân Cung', email: 'cung.pham@gmail.com', role: 'admin', joinedAt: '2024-02-01' },
  { id: 'm6', fundId: '2', name: 'Hoàng Minh Đức', email: 'duc.hoang@gmail.com', role: 'member', joinedAt: '2024-02-05' },
  { id: 'm7', fundId: '2', name: 'Vũ Khánh Linh', email: 'linh.vu@gmail.com', role: 'member', joinedAt: '2024-02-10' },
];

export default mockGroupMembers;

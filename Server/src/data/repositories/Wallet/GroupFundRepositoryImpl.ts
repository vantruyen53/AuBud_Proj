import type{IGroupFundRepository} from '../../../domain/models/application/repository/IWalletRepository.js';
import type { Pool,RowDataPacket } from "mysql2/promise";
import type{GroupFundEntity} from '../../../domain/entities/appEntities.js';

export class GroupFundRepository implements IGroupFundRepository {
    constructor(private pool: Pool) {}

    async findAllByUserId(userId: string): Promise<GroupFundEntity[]> {
        const sql = `
            SELECT gf.id, gf.name as fund_name, gf.balance, gt.name as group_name
            FROM group_fund gf
            INNER JOIN group_table gt ON gf.group_id = gt.id
            INNER JOIN member_group mg ON mg.group_id = gt.id
            WHERE mg.user_id = ? AND mg.status = 'joining'
        `;
        const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [userId]);
        return rows.map(r => ({
            id:        r.id,
            fundName:  r.fund_name,
            groupName: r.group_name,
            balance:   r.balance,
        }));
    }
}
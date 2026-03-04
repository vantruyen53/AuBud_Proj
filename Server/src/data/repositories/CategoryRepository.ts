import type{ ICategoryRepo } from "../../domain/models/application/repository/ICategoryRepo.js";
import type { Pool,RowDataPacket,ResultSetHeader } from "mysql2/promise";
import crypto from "crypto";
import type{ CategoryEntity } from "../../domain/entities/appEntities.js";
import type { CategoryDTO } from "../DTO/AppDTO.js";

export class CategoryRepository implements ICategoryRepo {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<CategoryEntity | null> {
    const query = `
        SELECT id, name, type, icon_name AS iconName, icon_color AS iconColor,
            user_id AS userId, is_default AS isDefault
        FROM \`category\`
        WHERE id = ? AND status = 'active'
    `;
    const [rows] = await this.pool.execute<RowDataPacket[]>(query, [id]);
    if (!rows.length) return null;
    return rows[0] as CategoryEntity;
    }

  async getSuggetedCategory(userId: string): Promise<CategoryEntity[]> {
    const query = `
      (
        SELECT id, name, type, icon_name AS iconName, icon_color AS iconColor
        FROM \`category\`
        WHERE type = 'sending'
          AND (user_id = ? OR is_default = TRUE)
          AND status = 'active'
        ORDER BY usageCount DESC
        LIMIT 8
      )
      UNION ALL
      (
        SELECT id, name, type, icon_name AS iconName, icon_color AS iconColor
        FROM \`category\`
        WHERE type = 'income'
          AND (user_id = ? OR is_default = TRUE)
          AND status = 'active'
        ORDER BY usageCount DESC
        LIMIT 8
      )
    `;
    const [rows] = await this.pool.execute<RowDataPacket[]>(query, [userId, userId]);
    return rows as CategoryEntity[];
  }

  async getAllCategory(userId: string): Promise<CategoryEntity[]> {
    const query = `
      SELECT id, name, type, icon_name AS iconName, icon_color AS iconColor
      FROM \`category\`
      WHERE (user_id = ? OR is_default = TRUE)
        AND status = 'active'
      ORDER BY type, usageCount DESC
    `;
    const [rows] = await this.pool.execute<RowDataPacket[]>(query, [userId]);
    return rows as CategoryEntity[];
  }

  async createCategory(payLoad: CategoryDTO): Promise<boolean> {
    const query = `
      INSERT INTO \`category\` (id, name, type, user_id, usageCount, icon_name, icon_color, is_default, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, ?)
    `;
    const [result] = await this.pool.execute<ResultSetHeader>(query, [
      payLoad.id,
      payLoad.name,
      payLoad.type,
      payLoad.userId,
      payLoad.usageCount ?? 0,
      payLoad.iconName,
      payLoad.iconColor,
      payLoad.status,
    ]);
    return result.affectedRows > 0;
  }

  async updateCategory(payLoad: CategoryDTO): Promise<boolean> {
    const query = `
      UPDATE \`category\`
      SET name = ?, type = ?, icon_name = ?, icon_color = ?
      WHERE id = ? AND user_id = ? AND is_default = FALSE
    `;
    const [result] = await this.pool.execute<ResultSetHeader>(query, [
      payLoad.name,
      payLoad.type,
      payLoad.iconName,
      payLoad.iconColor,
      payLoad.id,
      payLoad.userId,
    ]);
    console.log("=== affectedRows ===", result.affectedRows);
    return result.affectedRows > 0;
  }

  async deletedCategory(categoryId: string, userId: string): Promise<boolean> {
    const query = `
      UPDATE \`category\`
      SET status = 'deleted'
      WHERE id = ? AND user_id = ? AND is_default = FALSE
    `;
    const [result] = await this.pool.execute<ResultSetHeader>(query, [categoryId, userId]);
    return result.affectedRows > 0;
  }
}
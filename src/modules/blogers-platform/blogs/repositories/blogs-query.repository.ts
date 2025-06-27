import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getOne(blogId: number | null) {
    const query = `SELECT * FROM "blogs" WHERE "id" = $1`;
    const result = await this.dataSource.query(query, [blogId])
    return result[0] || null
  }
}
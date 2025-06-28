import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';


@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getOne(blogId: number) {

    const query = `SELECT * FROM "blogs" WHERE "id" = $1`;
    const result = await this.dataSource.query(query, [blogId]);
    const { id, ...responseBlog } = result[0];
    return {
      id: String(result[0].id),
      ...responseBlog,
    };
  }
}

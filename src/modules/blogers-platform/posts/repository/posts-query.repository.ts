import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getPostWithBlogData(postId: number) {
    const query = `
      SELECT p.id, p.title, p."shortDescription", p.content, p."createdAt", p."blogId", b.name as "blogName"
      FROM "posts" as p
      LEFT JOIN "blogs" as b
      ON p."blogId" = b.id 
      WHERE p.id = $1
    `;
    const result = await this.dataSource.query(query, [postId]);
    return result[0];
  }
}

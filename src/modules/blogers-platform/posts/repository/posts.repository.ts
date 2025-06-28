import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post } from '../types/posts-types';
import { Injectable } from '@nestjs/common';


@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(post: Post) {
    const query = `
        INSERT INTO "posts"
            ("title", "shortDescription", "content", "createdAt", "blogId")
        VALUES
            ($1, $2, $3, $4::timestamp with time zone, $5)
        RETURNING "id"
    `;

    const result = await this.dataSource.query(query, [
      post.title,
      post.shortDescription,
      post.content,
      post.createdAt,
      post.blogId,
    ]);

    if (!result || result.length === 0) {
      throw new Error('Failed to create post');
    }

    return result[0].id;
  }
}

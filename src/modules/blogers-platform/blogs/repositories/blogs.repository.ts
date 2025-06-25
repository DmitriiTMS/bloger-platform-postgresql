import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogsSchema } from '../schemas/blogs.schema';

export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(blog: BlogsSchema) {
    const query = `
        INSERT INTO "blogs"
            ("name", "description", "websiteurl", "createdAt", "isMembership")
        VALUES
            ($1, $2, $3, $4::timestamp with time zone, $5)
        RETURNING *
    `;

    const result = await this.dataSource.query(query, [
        blog.name,
        blog.description,
        blog.websiteUrl,
        blog.createdAt,
        blog.isMembership
    ]);

    if (!result || result.length === 0) {
        throw new Error('Failed to create blog');
    }

    return result[0];
  }
}

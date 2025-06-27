import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogsSchema } from '../schemas/blogs.schema';
import { CustomDomainException } from '../../../../setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from '../../../../setup/exceptions/filters/constants';
import { UpdateBlogDto } from '../dto/update-blog.dto';

export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(blog: BlogsSchema): Promise<number> {
    const query = `
        INSERT INTO "blogs"
            ("name", "description", "websiteurl", "createdAt", "isMembership")
        VALUES
            ($1, $2, $3, $4::timestamp with time zone, $5)
        RETURNING "id"
    `;

    const result = await this.dataSource.query(query, [
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt,
      blog.isMembership,
    ]);

    if (!result || result.length === 0) {
      throw new Error('Failed to create blog');
    }

    return result[0].id;
  }

  async getByIdOrNotFoundFail(blogId: string) {
    // 1. Проверяем, что ID является числом
    if (!/^\d+$/.test(blogId)) {
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: `Invalid blog ID == ${blogId} format`,
            field: 'id',
          },
        ],
      });
    }

    // 2. Преобразуем в число и проверяем диапазон
    const idNum = parseInt(blogId, 10);
    if (idNum <= 0 || idNum > 2147483647) {
      // PostgreSQL INTEGER max value
      throw new CustomDomainException({
        errorsMessages: [
          {
            message: `Blog ${blogId} out of valid range`,
            field: 'id',
          },
        ],
      });
    }

    const query = `SELECT id FROM "blogs" WHERE id = $1`;
    const blog = await this.dataSource.query(query, [blogId]);

    if (!blog || blog.length === 0) {
      throw new CustomDomainException({
        errorsMessages: `Blog by ${blogId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }
    return blog[0].id;
  }

  async updateBlog(blogId: number, updateBlogDto: UpdateBlogDto) {
    const query = `
    UPDATE "blogs"
    SET "name" = $1, "description" = $2, "websiteurl" = $3
    WHERE id = $4
  `;

    await this.dataSource.query(query, [
      updateBlogDto.name,
      updateBlogDto.description,
      updateBlogDto.websiteUrl,
      blogId,
    ]);
  }

  async delete(blogId: number) {
    const query = `DELETE FROM "blogs" WHERE id = $1`;
    await this.dataSource.query(query, [blogId]);
  }
}

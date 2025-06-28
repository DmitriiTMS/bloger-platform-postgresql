import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogsSchema } from '../schemas/blogs.schema';
import { CustomDomainException } from '../../../../setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from '../../../../setup/exceptions/filters/constants';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { Blog } from '../types/blogs-types';
import { Injectable } from '@nestjs/common';


@Injectable()
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

    const result = await this.dataSource.query<Array<{id: number}>>(query, [
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

  async getByIdOrNotFoundFail(blogId: number):Promise<number> {

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

  async getBlogByIdOrNotFoundFail(blogId: number): Promise<Blog> {
    const query = `SELECT id FROM "blogs" WHERE id = $1`;
    const blog = await this.dataSource.query(query, [blogId]);

    if (!blog || blog.length === 0) {
      throw new CustomDomainException({
        errorsMessages: `Blog by ${blogId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }
    return blog[0];
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

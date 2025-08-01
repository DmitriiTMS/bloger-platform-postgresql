import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../entitys/blog.entity';
import { Repository } from 'typeorm';
import { CustomDomainException } from 'src/setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from 'src/setup/exceptions/filters/constants';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Injectable()
export class BlogsTORMRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async create(blog: Blog) {
    const result = await this.blogRepository.save({
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
    });

    return result.id;
  }

  async getBlogByIdOrNotFoundFail(blogId: number) {
    const blog = await this.blogRepository.findOne({ where: { id: blogId } });

    if (!blog) {
      throw new CustomDomainException({
        errorsMessages: `Blog by ${blogId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }
    return blog;
  }

  async getByIdOrNotFoundFail(blogId: number): Promise<number> {
    const blog = await this.blogRepository.findOne({ where: { id: blogId } });

    if (!blog) {
      throw new CustomDomainException({
        errorsMessages: `Blog by ${blogId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }
    return blog.id;
  }

  async updateBlog(blogId: number, updateBlogDto: UpdateBlogDto) {
    await this.blogRepository.update(
      { id: blogId },
      {
        name: updateBlogDto.name,
        description: updateBlogDto.description,
        websiteUrl: updateBlogDto.websiteUrl,
      },
    );
  }

  async delete(blogId: number) {
    await this.blogRepository.delete({ id: blogId });
  }
}

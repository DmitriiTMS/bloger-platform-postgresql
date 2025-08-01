import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entitys/blog.entity';
import { CustomDomainException } from 'src/setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from 'src/setup/exceptions/filters/constants';

@Injectable()
export class BlogsQueryTORMRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async getOne(blogId: number) {
    const blog = await this.blogRepository.findOne({
      where: { id: blogId },
      select: {
        id: true,
        name: true,
        description: true,
        websiteUrl: true,
        createdAt: true,
        isMembership: true,
      },
    });

    console.log(blog);
    

    if (!blog) {
      throw new CustomDomainException({
        errorsMessages: `Blog by ${blogId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    const { id, ...responseBlog } = blog;
    return {
      id: String(blog.id),
      ...responseBlog,
    };
  }
}

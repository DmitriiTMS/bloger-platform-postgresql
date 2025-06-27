import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogsSchema } from './schemas/blogs.schema';
import { BlogsRepository } from './repositories/blogs.repository';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async createBlog(createBlogDto: CreateBlogDto): Promise<number> {
    const blog = BlogsSchema.createInstance({
      name: createBlogDto.name,
      description: createBlogDto.description,
      websiteUrl: createBlogDto.websiteUrl,
    });

    const blogId = await this.blogsRepository.create(blog);
    return blogId;
  }

  async updateBlog(id: string, blogDto: UpdateBlogDto) {
    const blogId = await this.blogsRepository.getByIdOrNotFoundFail(id);
    await this.blogsRepository.updateBlog(blogId, blogDto);
  }

  async deleteBlog(id: string) {
    const blogId = await this.blogsRepository.getByIdOrNotFoundFail(id);
    await this.blogsRepository.delete(blogId);
  }
}

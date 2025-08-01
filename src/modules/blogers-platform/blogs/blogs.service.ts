import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogsSchema } from './schemas/blogs.schema';
import { BlogsRepository } from './repositories/blogs.repository';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreatePostDto } from '../posts/dto/create-post.dto';
import { PostsService } from '../posts/posts.service';
import { Blog } from './entitys/blog.entity';
import { BlogsTORMRepository } from './repositories/blogsTORM.repository';


@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsService: PostsService,
    private blogsTORMRepository: BlogsTORMRepository
  ) {}

  async createBlog(createBlogDto: CreateBlogDto): Promise<number> {
    const blog = Blog.createInstance({
      name: createBlogDto.name,
      description: createBlogDto.description,
      websiteUrl: createBlogDto.websiteUrl,
    });

    // const blogId = await this.blogsRepository.create(blog);
    const blogId = await this.blogsTORMRepository.create(blog);
    return blogId;
  }

  async updateBlog(id: number, blogDto: UpdateBlogDto) {
    // const blogId = await this.blogsRepository.getByIdOrNotFoundFail(id);
    // await this.blogsRepository.updateBlog(blogId, blogDto);
    const blogId = await this.blogsTORMRepository.getByIdOrNotFoundFail(id);
    await this.blogsTORMRepository.updateBlog(blogId, blogDto);
  }

  async deleteBlog(id: number) {
    // const blogId = await this.blogsRepository.getByIdOrNotFoundFail(id);
    // await this.blogsRepository.delete(blogId);
    const blogId = await this.blogsTORMRepository.getByIdOrNotFoundFail(id);
    await this.blogsTORMRepository.delete(blogId);
  }

  async createPostByBlogId(
    blogId: number,
    postByBlogIdDto: CreatePostDto,
  ):Promise<number> {
    const postData = { blogId, postByBlogIdDto}
    return await this.postsService.createPost(postData);
  }

}

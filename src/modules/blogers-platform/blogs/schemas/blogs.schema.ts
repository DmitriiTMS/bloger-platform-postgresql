import { CreateBlogDto } from '../dto/create-blog.dto';

export class BlogsSchema {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  static createInstance(createBlogDto: CreateBlogDto): BlogsSchema {
    const blog = new this();

    blog.name = createBlogDto.name;
    blog.description = createBlogDto.description;
    blog.websiteUrl = createBlogDto.websiteUrl;
    blog.isMembership = false;
    blog.createdAt = new Date().toISOString();

    return blog;
  }
}

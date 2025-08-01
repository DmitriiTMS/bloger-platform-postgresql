import { Blog } from '../types/blogs-types';

export class BlogViewDto {
  id: number | string;
  createdAt: Date;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;

  static mapToView(blog: Blog) {
    const dto = new BlogViewDto();

    dto.id = blog.id.toString();
    dto.createdAt = blog.createdAt;
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.isMembership = blog.isMembership;
    return dto;
  }
}

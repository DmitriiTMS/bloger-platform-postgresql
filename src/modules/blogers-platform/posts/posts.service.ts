import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { BlogsRepository } from '../blogs/repositories/blogs.repository';
import { Post, UpdatePostByBlogId } from './types/posts-types';
import { PostsRepository } from './repository/posts.repository';

@Injectable()
export class PostsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async createPost(postData: {
    blogId: number;
    postByBlogIdDto: CreatePostDto;
  }):Promise<number> {
    const blog = await this.blogsRepository.getBlogById(postData.blogId);

    const post: Post = {
      title: postData.postByBlogIdDto.title,
      shortDescription: postData.postByBlogIdDto.shortDescription,
      content: postData.postByBlogIdDto.content,
      createdAt: new Date().toISOString(),
      blogId: blog.id!,
    };

    const postId = await this.postsRepository.save(post);
    return postId;
    
  }

  async updatePostBYBlogId(dataForUpdatePost: UpdatePostByBlogId) {
    console.log(dataForUpdatePost);
    
    return dataForUpdatePost
  }
}

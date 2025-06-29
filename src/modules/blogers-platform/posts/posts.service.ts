import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { BlogsRepository } from '../blogs/repositories/blogs.repository';
import { Post, UpdatePostByBlogId } from './types/posts-types';
import { PostsRepository } from './repository/posts.repository';
import { UpdatePostParamsDto } from '../blogs/dto/param/update-post-param.dto';

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
    const blog = await this.blogsRepository.getBlogByIdOrNotFoundFail(postData.blogId);

    const post: Post = {
      title: postData.postByBlogIdDto.title,
      shortDescription: postData.postByBlogIdDto.shortDescription,
      content: postData.postByBlogIdDto.content,
      createdAt: new Date().toISOString(),
      blogId: blog.id,
    };

    const postId = await this.postsRepository.save(post);
    return postId;
    
  }

  async updatePostBYBlogId(dataForUpdatePost: UpdatePostByBlogId) {
    await this.blogsRepository.getBlogByIdOrNotFoundFail(dataForUpdatePost.blogId)
    await this.postsRepository.getPostByIdOrNotFoundFail(dataForUpdatePost.postId)

    const { blogId, postId, ...body } = dataForUpdatePost;
    await this.postsRepository.updatePost(postId, body)

  }

   async deletePostByBlogId(dataForUpdatePost: UpdatePostParamsDto) {
    await this.blogsRepository.getBlogByIdOrNotFoundFail(dataForUpdatePost.blogId)
    await this.postsRepository.getPostByIdOrNotFoundFail(dataForUpdatePost.postId)
    await this.postsRepository.delete(dataForUpdatePost.postId)
  }
}

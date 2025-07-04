import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { BlogsRepository } from '../blogs/repositories/blogs.repository';
import { Post, UpdatePostByBlogId } from './types/posts-types';
import { PostsRepository } from './repository/posts.repository';
import { UpdatePostParamsDto } from '../blogs/dto/param/update-post-param.dto';
import { PostDataCommentCreateDto } from './dto/post-data-comment-create.dto';
import { CustomDomainException } from 'src/setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from 'src/setup/exceptions/filters/constants';
import { UsersRepository } from 'src/modules/users/users/users.repository';
import { CommentsRepository } from '../comments/comments.repository';
import { NewComment } from '../comments/types/types-comments';
import { PostDataReactionDto } from './dto/reaction/post-reaction-data.dto';
import { LikeStatus } from '../types-reaction';

@Injectable()
export class PostsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private commentRepository: CommentsRepository,
  ) {}

  async createPost(postData: {
    blogId: number;
    postByBlogIdDto: CreatePostDto;
  }): Promise<number> {
    const blog = await this.blogsRepository.getBlogByIdOrNotFoundFail(
      postData.blogId,
    );

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
    await this.blogsRepository.getBlogByIdOrNotFoundFail(
      dataForUpdatePost.blogId,
    );
    await this.postsRepository.getPostByIdOrNotFoundFail(
      dataForUpdatePost.postId,
    );

    const { blogId, postId, ...body } = dataForUpdatePost;
    await this.postsRepository.updatePost(postId, body);
  }

  async deletePostByBlogId(dataForUpdatePost: UpdatePostParamsDto) {
    await this.blogsRepository.getBlogByIdOrNotFoundFail(
      dataForUpdatePost.blogId,
    );
    await this.postsRepository.getPostByIdOrNotFoundFail(
      dataForUpdatePost.postId,
    );
    await this.postsRepository.delete(dataForUpdatePost.postId);
  }

  async createCommentsByPostId(
    dataForCreteCommentDto: PostDataCommentCreateDto,
  ) {
    const { content, postId, userId } = dataForCreteCommentDto;

    await this.postsRepository.getPostByIdOrNotFoundFail(postId);

    const user = await this.usersRepository.findById(userId);
    if (!user[0]) {
      throw new CustomDomainException({
        errorsMessages: `User by ${userId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    const newComment: NewComment = {
      postId: postId,
      content,
      userId,
      userLogin: user[0].login,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      dislikesCount: 0,
    };

    const createdComment = await this.commentRepository.save(newComment);
    return createdComment;
  }

  async addReaction(postDataReactionDto: PostDataReactionDto) {
    const { status, userId, postId } = postDataReactionDto;

    await this.postsRepository.getPostByIdOrNotFoundFail(postId);

    const user = await this.usersRepository.findById(userId);
    if (!user[0]) {
      throw new CustomDomainException({
        errorsMessages: `User by id = ${userId} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }

    const isReactionForPostIdAndUserId =
      await this.postsRepository.reactionForPostIdAndUserId(postId, userId);

    if (!isReactionForPostIdAndUserId) {
      await this.postsRepository.saveInPostReaction(postDataReactionDto);

      const [totalCountLike, totalCountDislike] = await Promise.all([
        this.postsRepository.postsLikeCount(postId, LikeStatus.LIKE),
        this.postsRepository.postsDislikeCount(postId, LikeStatus.DISLIKE),
      ]);

      await Promise.all([
        this.postsRepository.likeCountUpdate(postId, totalCountLike),
        this.postsRepository.dislikeCountUpdate(postId, totalCountDislike),
      ]);

      return;
    }

    if (status !== isReactionForPostIdAndUserId.status) {
      await this.postsRepository.updatePostReaction(
        isReactionForPostIdAndUserId.id,
        status,
      );
      const [totalCountLike, totalCountDislike] = await Promise.all([
        this.postsRepository.postsLikeCount(postId, LikeStatus.LIKE),
        this.postsRepository.postsDislikeCount(postId, LikeStatus.DISLIKE),
      ]);

      await Promise.all([
        this.postsRepository.likeCountUpdate(postId, totalCountLike),
        this.postsRepository.dislikeCountUpdate(postId, totalCountDislike),
      ]);
      return;
    }
  }
}

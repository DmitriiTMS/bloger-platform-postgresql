import { PostCommentCreateDto } from "./post-comment-create.dto";

export class PostDataCommentCreateDto extends PostCommentCreateDto {
    postId: number
    userId: number
}
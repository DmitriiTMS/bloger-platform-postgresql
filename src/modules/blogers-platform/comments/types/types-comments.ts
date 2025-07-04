import { LikeStatus } from "../../types-reaction";

export type NewComment = {
  postId: number;
  content: string;
  userId: number;
  userLogin: string;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
};

export type NewCommentDB = NewComment & {
  id: string
};

export type CommentDataReaction = {
    commentId: number
    userId: number
}

export type CommentUpdateDataReaction = CommentDataReaction &  {
    content: string
}



import { LikeStatus } from "../../types-reaction"


export class CommentDataReactionDto {
    status: LikeStatus
    commentId: number
    userId: number
}
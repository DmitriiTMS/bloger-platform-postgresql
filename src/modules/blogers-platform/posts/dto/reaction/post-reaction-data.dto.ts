import { LikeStatus } from "../../../../../modules/blogers-platform/types-reaction"



export class PostDataReactionDto {
    status: LikeStatus
    postId: number
    userId: number
    created_at: string
}
import { IsEnum, IsNotEmpty } from 'class-validator';
import { LikeStatus } from '../../types-reaction';

export class CommentReactionDto {
  @IsEnum(LikeStatus, {
    message: `LikeStatus должен быть одним из: ${Object.values(LikeStatus).join(', ')}`,
  })
  @IsNotEmpty({ message: 'LikeStatus обязателен к заполнению' })
  likeStatus: LikeStatus;
}

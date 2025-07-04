import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CommentIdParamDto {
  @Type(() => Number) // Преобразует строку в число
  @Min(1, { message: 'commentId должен быть больше 0' })
  @IsInt({ message: 'commentId должен быть целым числом' })
  @IsNotEmpty({ message: 'commentId блога обязателен' })
  commentId: number;
}

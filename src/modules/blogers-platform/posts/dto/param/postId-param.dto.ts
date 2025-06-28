import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class PostIdParamDto {
  @Type(() => Number) // Преобразует строку в число
  @Min(1, { message: 'postId должен быть больше 0' })
  @IsInt({ message: 'postId должен быть целым числом' })
  @IsNotEmpty({ message: 'postId блога обязателен' })
  postId: number;
}

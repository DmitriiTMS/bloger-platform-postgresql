import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class IdParamCommentDto {
  @Type(() => Number) // Преобразует строку в число
  @Min(1, { message: 'id должен быть больше 0' })
  @IsInt({ message: 'id должен быть целым числом' })
  @IsNotEmpty({ message: 'id comment обязателен' })
  id: number;
}

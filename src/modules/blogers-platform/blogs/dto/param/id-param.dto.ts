import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class IdParamBlogDto {
  @IsInt({ message: 'ID должен быть целым числом' })
  @Min(1, { message: 'ID должен быть больше 0' })
  @IsNotEmpty({ message: 'ID блога обязателен' })
  @Type(() => Number) // для преобразования строки в число
  id: number;
}

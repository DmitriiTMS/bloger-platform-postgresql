import {
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  ArrayMinSize,
  MinLength,
} from 'class-validator';
import { Trim } from 'src/modules/users/users/decorators/dto-decorators/trim.decorator';

export class UpdateQuestionDto {
  @IsString({ message: 'Body вопроса должно быть строкой' })
  @IsNotEmpty({ message: 'Body вопроса не может быть пустым' })
  @MinLength(10, { message: 'Минимальное количество символов 10' })
  @MaxLength(500, { message: 'Максимальное количество символов 500' })
  @Trim()
  body: string;

  @IsArray({ message: 'СorrectAnswers должен быть массивом' })
  @ArrayMinSize(1, {
    message: 'В СorrectAnswers должен быть хотя бы один элемент',
  })
  @IsString({ each: true, message: 'Должен быть массив строк' })
  @IsNotEmpty({ each: true, message: 'Строки не должны быть пустые' })
  correctAnswers: string[];
}

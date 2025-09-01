import { IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateIsPublishQuestionDto {
  @IsBoolean({ message: 'Publish вопроса должно быть булевым' })
  @IsNotEmpty({ message: 'Publish вопроса не может быть пустым' })
  published: boolean;
}

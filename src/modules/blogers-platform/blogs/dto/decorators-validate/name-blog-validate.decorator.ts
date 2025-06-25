import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString,  MaxLength } from 'class-validator';
import { Trim } from '../../../../../modules/users/users/decorators/dto-decorators/trim.decorator';


export const NameBlogApplyDecorator = () =>
  applyDecorators(Trim(), IsNotEmpty({message: 'Name blog не может быть пустым'}), IsString(), MaxLength(15));
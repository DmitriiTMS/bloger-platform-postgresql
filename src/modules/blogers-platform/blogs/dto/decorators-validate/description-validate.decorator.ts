import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString,  MaxLength } from 'class-validator';
import { Trim } from '../../../../../modules/users/users/decorators/dto-decorators/trim.decorator';


export const DescriptionBlogApplyDecorator = () =>
  applyDecorators(Trim(), IsNotEmpty(), IsString(), MaxLength(500));
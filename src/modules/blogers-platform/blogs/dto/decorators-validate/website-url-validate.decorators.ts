import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, Matches,  MaxLength } from 'class-validator';
import { Trim } from '../../../../../modules/users/users/decorators/dto-decorators/trim.decorator';


export const WebsiteUrlBlogApplyDecorator = (regex: RegExp) =>
  applyDecorators(Trim(), IsNotEmpty(), Matches(regex), MaxLength(100));
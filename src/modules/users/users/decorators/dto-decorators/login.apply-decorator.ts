import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Trim } from './trim.decorator';


export const LoginApplyDecorator = (regex: RegExp) =>
  applyDecorators(
    Trim(),
    IsNotEmpty(),
    IsString(),
    Length(3, 10),
    Matches(regex),
  );
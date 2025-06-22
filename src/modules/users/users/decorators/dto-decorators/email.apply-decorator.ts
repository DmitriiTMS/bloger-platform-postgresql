import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { Trim } from './trim.decorator';

export const EmailApplyDecorator = (regex: RegExp) =>
  applyDecorators(
    Trim(),
    IsNotEmpty(),
    IsEmail(),
    Matches(regex),
  );
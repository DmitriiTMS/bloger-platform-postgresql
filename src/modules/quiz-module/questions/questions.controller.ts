import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from 'src/modules/users/users/guards/basic-auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionsService } from './questions.service';
import { QuestionResponseView } from './types/questions-types';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return 'findAll questions';
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(
    @Body() body: CreateQuestionDto,
  ): Promise<QuestionResponseView> {
    return await this.questionsService.createQuestion(body);
  }
}

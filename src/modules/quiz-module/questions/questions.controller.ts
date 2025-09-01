import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from 'src/modules/users/users/guards/basic-auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionsService } from './questions.service';
import { QuestionResponseView } from './types/questions-types';
import { GetQuestionsQueryParams } from './paginate/get-questions-paginate.dto';
import { QuestionsQueryRepository } from './questions.query-repository';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { DataForUpdateQuestion } from './types/data-update-body-and-answer';
import { UpdateIsPublishQuestionDto } from './dto/is-publish.dto';
import { DataIsPublishQuestion } from './types/data-is-publish-question';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
export class QuestionsController {
  constructor(
    private questionsService: QuestionsService,
    private questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: GetQuestionsQueryParams) {
    return await this.questionsQueryRepository.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(
    @Body() body: CreateQuestionDto,
  ): Promise<QuestionResponseView> {
    return await this.questionsService.createQuestion(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestionByIdBodyAndAnswer(
    @Param('id') id: number,
    @Body() body: UpdateQuestionDto,
  ) {
    const dataForUpdateQuestion: DataForUpdateQuestion = {
      id,
      body: body.body,
      correctAnswers: body.correctAnswers
    };
    return await this.questionsService.updateQuestionByIdBodyAndAnswer(
      dataForUpdateQuestion,
    );
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestionByIdPublish(
    @Param('id') id: number,
    @Body() body: UpdateIsPublishQuestionDto,
  ) {
    const dataForUpdateQuestion: DataIsPublishQuestion = {
      id,
      published: body.published,
    };
    return await this.questionsService.updateQuestionByIdIsPublish(
      dataForUpdateQuestion,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    return this.questionsService.remove(id);
  }
}

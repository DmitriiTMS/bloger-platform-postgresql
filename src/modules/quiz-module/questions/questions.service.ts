import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionsRepository } from './questions.repository';
import { QuestionResponseView } from './types/questions-types';

@Injectable()
export class QuestionsService {
  constructor(private questionsRepository: QuestionsRepository) {}

  async createQuestion(dto: CreateQuestionDto): Promise<QuestionResponseView> {
    return await this.questionsRepository.create(dto);
  }
}

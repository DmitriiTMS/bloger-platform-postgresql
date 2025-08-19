import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Questions } from '../entitys/questions.entitys';
import { Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import {
  QuestionResponseDB,
  QuestionResponseView,
} from './types/questions-types';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Questions)
    private readonly questionsRepository: Repository<Questions>,
  ) {}

  async create(dto: CreateQuestionDto): Promise<QuestionResponseView> {
    const question = await this.questionsRepository.save({
      body: dto.body,
      correctAnswers: dto.correctAnswers,
    });

    return this.mapToView(question);
  }

  private mapToView(question: QuestionResponseDB): QuestionResponseView {
    return {
      id: question.id.toString(),
      body: question.body,
      correctAnswers: question.correctAnswers,
      published: question.published,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    };
  }
}

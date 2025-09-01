import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Questions } from '../entitys/questions.entitys';
import { Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import {
  QuestionResponseDB,
  QuestionResponseView,
} from './types/questions-types';
import { CustomDomainException } from 'src/setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from 'src/setup/exceptions/filters/constants';
import { DataForUpdateQuestion } from './types/data-update-body-and-answer';
import { DataIsPublishQuestion } from './types/data-is-publish-question';

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

  async getQuestionByIdOrNotFoundFail(id: number) {
    const question = await this.questionsRepository.findOne({ where: { id } });

    if (!question) {
      throw new CustomDomainException({
        errorsMessages: `Question by ${id} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }
    return question;
  }

  async findById(id: number) {
    return await this.questionsRepository.findOne({ where: { id } });
  }

  async updateQuestionBodyAndAnswer(dataForUpdateQuestion: DataForUpdateQuestion) {
    await this.questionsRepository.update(
      { id: dataForUpdateQuestion.id },
      {
        body: dataForUpdateQuestion.body,
        correctAnswers: dataForUpdateQuestion.correctAnswers,
      },
    );
  }

  async updateQuestionIsPublished(dataForUpdateQuestion: DataIsPublishQuestion) {
    await this.questionsRepository.update(
      { id: dataForUpdateQuestion.id },
      {
        published: dataForUpdateQuestion.published,
      },
    );
  }

  async delete(id: number) {
    const questionById = await this.findById(id);
    if (!questionById) {
      throw new CustomDomainException({
        errorsMessages: `Question by ${id} not found`,
        customCode: DomainExceptionCode.NotFound,
      });
    }
    await this.questionsRepository.delete({ id });
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

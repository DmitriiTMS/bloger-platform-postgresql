import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionsRepository } from './questions.repository';
import { QuestionResponseView } from './types/questions-types';
import { DataForUpdateQuestion } from './types/data-update-body-and-answer';
import { CustomDomainException } from 'src/setup/exceptions/custom-domain.exception';
import { DomainExceptionCode } from 'src/setup/exceptions/filters/constants';
import { DataIsPublishQuestion } from './types/data-is-publish-question';

@Injectable()
export class QuestionsService {
  constructor(private questionsRepository: QuestionsRepository) {}

  async createQuestion(dto: CreateQuestionDto): Promise<QuestionResponseView> {
    return await this.questionsRepository.create(dto);
  }

  async updateQuestionByIdBodyAndAnswer(dataForUpdateQuestion: DataForUpdateQuestion) {
    const question = await this.questionsRepository.getQuestionByIdOrNotFoundFail(dataForUpdateQuestion.id);

    // if(question.published === true) {
    //   throw new CustomDomainException({
    //     errorsMessages: `Question by bad request updateQuestionByIdBodyAndAnswer`,
    //     customCode: DomainExceptionCode.BadRequest,
    //   });
    // }

    await this.questionsRepository.updateQuestionBodyAndAnswer(dataForUpdateQuestion);
  }

   async updateQuestionByIdIsPublish(dataForUpdateQuestion: DataIsPublishQuestion) {
    const question = await this.questionsRepository.getQuestionByIdOrNotFoundFail(dataForUpdateQuestion.id);

    // if(question.published === true) {
    //   throw new CustomDomainException({
    //     errorsMessages: `Question by bad request updateQuestionByIdBodyAndAnswer`,
    //     customCode: DomainExceptionCode.BadRequest,
    //   });
    // }

    await this.questionsRepository.updateQuestionIsPublished(dataForUpdateQuestion);
  }

  async remove(id: number) {
    await this.questionsRepository.delete(id);
  }
}

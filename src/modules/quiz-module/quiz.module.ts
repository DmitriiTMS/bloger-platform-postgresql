import { Module } from '@nestjs/common';
import { QuestionsController } from './questions/questions.controller';
import { QuestionsService } from './questions/questions.service';
import { QuestionsRepository } from './questions/questions.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Questions } from './entitys/questions.entitys';
import { QuestionsQueryRepository } from './questions/questions.query-repository';

@Module({
  imports: [TypeOrmModule.forFeature([Questions]),],
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionsRepository, QuestionsQueryRepository],
})
export class QuizModule {}

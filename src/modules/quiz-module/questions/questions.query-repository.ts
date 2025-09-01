import { Injectable } from '@nestjs/common';
import {
  GetQuestionsQueryParams,
  QuestionsPublishedStatus,
} from './paginate/get-questions-paginate.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QuestionViewDto } from './dto/question-view.dto';
import { PaginatedViewDto } from 'src/core/paginate/base.paginate.view-dto';

@Injectable()
export class QuestionsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findAll(query: GetQuestionsQueryParams) {
    // Базовый запрос
    let baseSQLquery = 'SELECT * FROM "questions"';
    const params: any[] = [];
    const conditions: string[] = [];

    // Добавляем условия поиска по тексту вопроса
    if (query.bodySearchTerm) {
      conditions.push('body ILIKE $' + (params.length + 1));
      params.push(`%${query.bodySearchTerm}%`);
    }

    // Добавляем условие по статусу публикации
    if (query.publishedStatus && query.publishedStatus !== QuestionsPublishedStatus.ALL) {
      const publishedValue = query.publishedStatus === QuestionsPublishedStatus.PUBLISHED;
      conditions.push('published = $' + (params.length + 1));
      params.push(publishedValue);
    }

    // Добавляем WHERE только если есть условия
    if (conditions.length > 0) {
      baseSQLquery += ' WHERE ' + conditions.join(' AND ');
    }

    // Сортировка
    const sortBy = query.sortBy || 'createdAt';
    const sortDirection = query.sortDirection || 'DESC'; // Изменено на DESC по умолчанию

    if (sortBy === 'body' || sortBy === 'published') {
      baseSQLquery += ` ORDER BY "${sortBy}" COLLATE "C" ${sortDirection}`;
    } else {
      baseSQLquery += ` ORDER BY "${sortBy}" ${sortDirection}`;
    }

    // Пагинация
    const pageSize = query.pageSize || 10;
    const pageNumber = query.pageNumber || 1;
    const offset = (pageNumber - 1) * pageSize;

    baseSQLquery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageSize.toString(), offset.toString());

    // Выполняем запрос
    const questions = await this.dataSource.query(baseSQLquery, params);

    // Маппим результаты
    const items = questions.map(QuestionViewDto.mapToView);

    // Запрос для получения общего количества
    let countQuery = 'SELECT COUNT(*) FROM "questions"';
    const countParams: any[] = [];
    const countConditions: string[] = [];

    // Те же условия, что и в основном запросе
    if (query.bodySearchTerm) {
      countConditions.push('body ILIKE $' + (countParams.length + 1));
      countParams.push(`%${query.bodySearchTerm}%`);
    }

    if (query.publishedStatus && query.publishedStatus !== QuestionsPublishedStatus.ALL) {
      const publishedValue = query.publishedStatus === QuestionsPublishedStatus.PUBLISHED;
      countConditions.push('published = $' + (countParams.length + 1));
      countParams.push(publishedValue);
    }

    if (countConditions.length > 0) {
      countQuery += ' WHERE ' + countConditions.join(' AND ');
    }

    const totalCountResult = await this.dataSource.query(
      countQuery,
      countParams,
    );
    const totalCount = Number(totalCountResult[0].count);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: pageNumber,
      size: pageSize,
    });
  }
}

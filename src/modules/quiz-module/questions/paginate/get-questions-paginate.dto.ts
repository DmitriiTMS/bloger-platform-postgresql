import { BaseQueryParams } from 'src/core/paginate/base.query-params.dto';

export enum QuestionsSortBy {
  CreatedAt = 'createdAt',
  BodySearchTerm = 'body',
  Published = 'published'
}

export enum QuestionsPublishedStatus {
  ALL = 'all',
  PUBLISHED = 'published',
  NOTPUBLOSHED = 'notPublished',
}

export class GetQuestionsQueryParams extends BaseQueryParams {
  sortBy = QuestionsSortBy.CreatedAt;
  bodySearchTerm: string | null = null;
  publishedStatus: QuestionsPublishedStatus = QuestionsPublishedStatus.ALL;
}

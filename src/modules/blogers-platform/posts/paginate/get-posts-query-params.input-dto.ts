import { BaseQueryParams } from '../../../../core/paginate/base.query-params.dto';

export enum PostsSortBy {
  CreatedAt = 'createdAt',
}

export class GetPostsQueryParams extends BaseQueryParams {
  sortBy = PostsSortBy.CreatedAt;
}

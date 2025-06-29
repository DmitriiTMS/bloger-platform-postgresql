import { BaseQueryParams } from 'src/core/paginate/base.query-params.dto';

export enum BlogsSortBy {
  CreatedAt = 'createdAt',
  Name = 'name',
  Description = 'description',
  Websiteurl = 'websiteurl'
}

export class GetBlogsQueryParams extends BaseQueryParams {
  sortBy = BlogsSortBy.CreatedAt;
  searchNameTerm: string | null = null;
}

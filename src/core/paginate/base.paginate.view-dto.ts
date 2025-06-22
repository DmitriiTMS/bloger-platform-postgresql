//базовый класс view модели для запросов за списком с пагинацией
export class PaginatedViewDto<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;

  //статический метод-утилита для мапинга
  public static mapToView<T>(data: {
    items: T;
    page: number;
    size: number;
    totalCount: number;
  }): PaginatedViewDto<T> {
    return {
      totalCount: data.totalCount,
      pagesCount: Math.ceil(data.totalCount / data.size),
      page: data.page,
      pageSize: data.size,
      items: data.items,
    };
  }
}
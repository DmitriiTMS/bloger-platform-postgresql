export class PostViewDto {
  id: string | number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: 0;
    dislikesCount: 0;
    myStatus: 'None';
    newestLikes: [
      {
        addedAt: '2025-06-28T13:44:21.003Z';
        userId: 'userId';
        login: 'login';
      },
    ];
  };

  static mapToView(post, reactions): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = {
      likesCount: reactions.likesCount,
      dislikesCount: reactions.dislikesCount,
      myStatus: reactions.myStatus,
      newestLikes: [
        {
          addedAt: '2025-06-28T13:44:21.003Z',
          userId: 'userId',
          login: 'login',
        },
      ],
    };

    return dto;
  }
}

import { LikeStatus } from '../../types-reaction';

// export class PostViewDto {
//   id: string | number;
//   title: string;
//   shortDescription: string;
//   content: string;
//   blogId: string;
//   blogName: string;
//   createdAt: Date;
//   extendedLikesInfo: {
//     likesCount: 0;
//     dislikesCount: 0;
//     myStatus: LikeStatus;
//     newestLikes: [
//       {
//         addedAt: string;
//         userId: string;
//         login: string;
//       },
//     ];
//   };

//   static mapToView(post, likesCount?: any, dislikesCount?: any): PostViewDto {
//     const dto = new PostViewDto();

//     dto.id = post.id;
//     dto.title = post.title;
//     dto.shortDescription = post.shortDescription;
//     dto.content = post.content;
//     dto.blogId = post.blogId;
//     dto.blogName = post.blogName;
//     dto.createdAt = post.createdAt;
//     dto.extendedLikesInfo = {
//       likesCount: likesCount,
//       dislikesCount: dislikesCount,
//       myStatus: LikeStatus.NONE,
//       newestLikes: [
//         {
//           addedAt: '2025-06-28T13:44:21.003Z',
//           userId: 'userId',
//           login: 'login111111',
//         },
//       ],
//     };

//     return dto;
//   }
// }

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: Array<{
      addedAt: string;
      userId: string;
      login: string;
    }>;
  };

  static mapToView(
    post: {
      id: string;
      title: string;
      shortDescription: string;
      content: string;
      blogId: string;
      blogName: string;
      createdAt: Date;
      likesCount?: number;
      dislikesCount?: number;
    },
    newestLikes: Array<{
      addedAt: string;
      userId: string;
      login: string;
    }> = [],
    myStatus: LikeStatus = LikeStatus.NONE,
    likesCount: number = 0,
    dislikesCount: number = 0
  ): PostViewDto {
    const dto = new PostViewDto();
    
    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;
    
    dto.extendedLikesInfo = {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      myStatus: myStatus,
      newestLikes: newestLikes
    };

    return dto;
  }
}

export class PostViewDto1111 {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: Array<{
      addedAt: string;
      userId: string;
      login: string;
    }>;
  };

  static mapToView(
    post: {
      id: string;
      title: string;
      shortDescription: string;
      content: string;
      blogId: string;
      blogName: string;
      createdAt: Date;
    },
    newestLikes: Array<{
      addedAt: string;
      userId: string;
      login: string;
    }> = [],
    myStatus: LikeStatus = LikeStatus.NONE,
    likesCount: number = 0,
    dislikesCount: number = 0,
  ): PostViewDto1111 {
    const dto = new PostViewDto1111();

    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;

    dto.extendedLikesInfo = {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      myStatus: myStatus,
      newestLikes: newestLikes,
    };

    return dto;
  }
}

import { BaseEntity } from '../../../../modules/entitys/base.entyty';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Post } from './post.entity';
import { User } from 'src/modules/users/users/entitys/users.entity';

@Entity({ name: 'posts_reactions' })
export class PostsReactions extends BaseEntity {
  @Column({ type: 'varchar' })
  status: string;

  @Column({ type: 'bigint' })
  userId: number;

  @Column({ type: 'bigint' })
  postId: number;

  @ManyToOne(() => Post, (post) => post.postsReactions, { onDelete: 'CASCADE' })
  @JoinColumn()
  public post: Post;

  @ManyToOne(() => User, (user) => user.postsReactions) // или другое имя, если нужно
  @JoinColumn({ name: 'userId' }) // связываем с колонкой `userId`
  user: User;
}

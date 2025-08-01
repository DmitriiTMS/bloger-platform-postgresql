import { BaseEntity } from '../../../../modules/entitys/base.entyty';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Post } from './post.entity';

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
}

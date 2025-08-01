import { BaseEntity } from '../../../../modules/entitys/base.entyty';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Blog } from '../../blogs/entitys/blog.entity';
import { PostsReactions } from './posts_reactions.entity';

@Entity({ name: 'posts' })
export class Post extends BaseEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  shortDescription: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'bigint', default: 0 })
  likesCount: number;

  @Column({ type: 'bigint', default: 0 })
  dislikesCount: number;

  @OneToMany(() => PostsReactions, (postsReaction) => postsReaction.post)
  postsReactions: PostsReactions[];

  @ManyToOne(() => Blog, (blog) => blog.posts, { onDelete: 'CASCADE' })
  @JoinColumn()
  public blog: Blog;

  @Column({ type: 'bigint' })
  blogId: number;
}

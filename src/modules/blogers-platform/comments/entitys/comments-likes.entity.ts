import { BaseEntity } from '../../../../modules/entitys/base.entyty';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'comment_likes' })
export class CommentLikes extends BaseEntity {

  @Column({ type: 'bigint' })
  comment_id: number;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'varchar' })
  statusn: string;

}

import { BaseEntity } from '../../../../modules/entitys/base.entyty';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'comments' })
export class Comments extends BaseEntity {

  @Column({ type: 'bigint' })
  post_id: number;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'varchar' })
  user_login: string;

  @Column({ type: 'bigint', default: 0 })
  likes_count: number;

  @Column({ type: 'bigint', default: 0 })
  dislikes_count: number;
}

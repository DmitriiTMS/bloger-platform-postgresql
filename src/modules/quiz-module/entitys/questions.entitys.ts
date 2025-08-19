import { BaseEntity } from '../../entitys/base.entyty';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'questions' })
export class Questions extends BaseEntity {
  @Column({ type: 'varchar' })
  body: string;

  @Column({ type: 'json', default: '[]' })
  correctAnswers: string[];

  @Column({ type: 'boolean', default: false })
  published: boolean;
}

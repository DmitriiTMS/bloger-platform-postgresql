import { BaseEntity } from '../../../../modules/entitys/base.entyty';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entitys/users.entity';

@Entity({ name: 'devices' })
export class Devices extends BaseEntity {
  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  lastActiveDate: string;

  @Column({ type: 'varchar' })
  deviceId: string;

  @Column({
    type: 'timestamptz',
  })
  expirationDateRefreshToken: Date;

  @Column({ type: 'varchar' })
  refreshToken: string;

  @ManyToOne(() => User, (user) => user.devices)
  @JoinColumn()
  public user: User;

  @Column()
  userId: number;
}

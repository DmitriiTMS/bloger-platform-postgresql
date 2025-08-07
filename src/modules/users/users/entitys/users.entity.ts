import { BaseEntity } from '../../../../modules/entitys/base.entyty';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { EmailConfirmation } from './email-confirmations.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { Devices } from '../../devices/entities/devices.entity';
import { Post } from 'src/modules/blogers-platform/posts/entity/post.entity';
import { PostsReactions } from 'src/modules/blogers-platform/posts/entity/posts_reactions.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ type: 'varchar' })
  login: string;

  @Column({ type: 'varchar' })
  hashPassword: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @OneToOne(() => EmailConfirmation, (emailConf) => emailConf.user)
  emailConfirmation: EmailConfirmation;

  @OneToMany(() => Devices, (devices) => devices.user)
  devices: Devices;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => PostsReactions, (reaction) => reaction.user)
  postsReactions: PostsReactions[];

  static createInstance(dto: CreateUserDto): User {
    const user = new this();
    user.login = dto.login;
    user.email = dto.email;
    user.hashPassword = dto.password;
    return user;
  }
}

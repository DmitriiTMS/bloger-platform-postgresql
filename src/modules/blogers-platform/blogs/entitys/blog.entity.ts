import { BaseEntity } from '../../../../modules/entitys/base.entyty';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { Post } from '../../posts/entity/post.entity';

@Entity({ name: 'blogs' })
export class Blog extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar' })
  websiteUrl: string;

  @Column({default: false})
  isMembership: boolean;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];

  static createInstance(createBlogDto: CreateBlogDto): Blog {
    const blog = new this();

    blog.name = createBlogDto.name;
    blog.description = createBlogDto.description;
    blog.websiteUrl = createBlogDto.websiteUrl;

    return blog;
  }
}

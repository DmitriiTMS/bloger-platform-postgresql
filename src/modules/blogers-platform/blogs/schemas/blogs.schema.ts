import { DomainExceptionCode } from 'src/setup/exceptions/filters/constants';
import { CustomDomainException } from '../../../../setup/exceptions/custom-domain.exception';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

export class BlogsSchema {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  static createInstance(createBlogDto: CreateBlogDto): BlogsSchema {
    const blog = new this();

    blog.name = createBlogDto.name;
    blog.description = createBlogDto.description;
    blog.websiteUrl = createBlogDto.websiteUrl;
    blog.isMembership = false;
    blog.createdAt = new Date().toISOString();

    return blog;
  }

  // update(updateBlogDto: UpdateBlogDto) {
  //   if (
  //     updateBlogDto.name !== this.name ||
  //     updateBlogDto.description !== this.description ||
  //     updateBlogDto.websiteUrl !== this.websiteUrl
  //   ) {
  //     this.name = this.name;
  //     this.description = this.description;
  //     this.websiteUrl = this.websiteUrl;
  //   } else {
  //     throw new CustomDomainException({
  //       errorsMessages: `Не переданы нужные параметры для обновления blog`,
  //       customCode: DomainExceptionCode.BadRequest,
  //     });
  //   }
  // }
}

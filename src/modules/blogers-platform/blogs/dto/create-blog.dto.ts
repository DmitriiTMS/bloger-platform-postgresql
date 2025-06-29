import { DescriptionBlogApplyDecorator } from "./decorators-validate/description-validate.decorator";
import { NameBlogApplyDecorator } from "./decorators-validate/name-blog-validate.decorator";
import { WebsiteUrlBlogApplyDecorator } from "./decorators-validate/website-url-validate.decorators";


export class CreateBlogDto {
 @NameBlogApplyDecorator()
  name: string;

  @DescriptionBlogApplyDecorator()
  description: string;

  @WebsiteUrlBlogApplyDecorator(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
  websiteUrl: string;
}
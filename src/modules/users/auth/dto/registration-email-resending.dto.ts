import { EmailApplyDecorator } from "../../users/decorators/dto-decorators/email.apply-decorator";


export class RegistrationEmailEesendingDto {
  @EmailApplyDecorator(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}
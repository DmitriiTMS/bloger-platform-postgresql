import { Controller, UseGuards } from "@nestjs/common";
import { BasicAuthGuard } from "../../../modules/users/users/guards/basic-auth.guard";

@UseGuards(BasicAuthGuard)
@Controller('sa/posts')
export class PostsController {

}
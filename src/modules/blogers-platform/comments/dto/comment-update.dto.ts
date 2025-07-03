import { IsNotEmpty, IsString, Length } from "class-validator";

export class CommentUpdateDto {
    @Length(20,300, {message: 'Content должен быть минимум 20 символов и максимум 300 символов'})
    @IsString({message: 'Content должен быть строкой'})
    @IsNotEmpty({message: 'Content не может быть пустым'})
    content: string
}
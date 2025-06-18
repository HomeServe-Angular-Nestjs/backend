import { IsDefined, IsString } from "class-validator";

export class CreateChatDto {
    @IsDefined()
    @IsString()
    userId: string;
}
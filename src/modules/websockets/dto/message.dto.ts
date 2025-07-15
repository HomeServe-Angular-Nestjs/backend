import { IsDefined, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserType } from "src/modules/auth/dtos/login.dto";

export class GetMessagesDto {
    @IsNotEmpty()
    @IsString()
    chatId: string;

    @IsOptional()
    @IsString()
    beforeMessageId: string;
}

export class SendMessageDto {
    @IsNotEmpty()
    @IsString()
    receiverId: string;

    @IsDefined()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(['provider', 'customer', 'admin'])
    type: UserType;
}

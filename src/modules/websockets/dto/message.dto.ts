import { UserType } from '@core/entities/interfaces/user.entity.interface';
import { IsDefined, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class GetMessagesDto {
    @IsNotEmpty()
    @IsString()
    chatId: string;

    @IsNotEmpty()
    @IsString()
    receiverId: string; //used in guard

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

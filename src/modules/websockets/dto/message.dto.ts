import { UserType } from '@core/entities/interfaces/user.entity.interface';
import { IsDefined, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

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

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number;
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

  @IsOptional()
  @IsString()
  clientMessageId?: string;
}

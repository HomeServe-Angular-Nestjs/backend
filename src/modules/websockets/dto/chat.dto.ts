import { IsDefined, IsIn, IsString } from 'class-validator';

export class GetChatDto {
    @IsDefined()
    @IsString()
    id: string;

    @IsDefined()
    @IsString()
    @IsIn(['provider', 'customer', 'admin'])
    type: string;
}
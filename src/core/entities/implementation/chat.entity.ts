import { BaseEntity } from '../base/implementation/base.entity';
import { IBlockedInfo, IChat, IParticipant } from '../interfaces/chat.entity.interface';

export class Chat extends BaseEntity implements IChat {
    participants: [IParticipant, IParticipant];
    lastMessage?: string;
    lastSeenAt?: Date;
    blockedInfo?: IBlockedInfo | null;

    constructor(partial: Partial<Chat>) {
        super(partial);
        Object.assign(this, partial);
    }
}
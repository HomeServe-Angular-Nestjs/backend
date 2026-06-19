import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class CallReceiverDto {
    @IsNotEmpty()
    @IsString()
    callee: string;
}

export class SignalPayloadDto {
    @IsIn(['offer', 'answer', 'ice-candidate', 'media-error'])
    type: 'offer' | 'answer' | 'ice-candidate' | 'media-error';

    @IsString()
    targetUserId: string;

    @IsOptional()
    @IsObject()
    offer?: RTCSessionDescriptionInit;

    @IsOptional()
    @IsObject()
    answer?: RTCSessionDescriptionInit;

    @IsOptional()
    @IsObject()
    candidate?: RTCIceCandidateInit;
}
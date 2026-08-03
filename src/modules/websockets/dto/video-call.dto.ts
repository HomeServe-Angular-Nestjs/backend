import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class CallReceiverDto {
    @IsNotEmpty()
    @IsString()
    callee: string;
}

export class CallAcceptDto {
    @IsNotEmpty()
    @IsString()
    callId: string;
}

export class CallDeclineDto {
    @IsNotEmpty()
    @IsString()
    callId: string;
}

export class CallLeaveDto {
    @IsNotEmpty()
    @IsString()
    callId: string;
}

export class CallJoinDto {
    @IsNotEmpty()
    @IsString()
    callId: string;
}

export class SignalPayloadDto {
    @IsNotEmpty()
    @IsString()
    callId: string;

    @IsIn(['offer', 'answer', 'ice-candidate', 'media-error'])
    type: 'offer' | 'answer' | 'ice-candidate' | 'media-error';

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

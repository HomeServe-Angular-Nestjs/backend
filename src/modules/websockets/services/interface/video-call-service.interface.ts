import { ICallSession } from "@core/entities/interfaces/call-session.interface";
import { CallStatus } from "@core/enum/call.enum";

export interface IVideoCallService {
    createSession(callId: string, callerId: string, receiverId: string, callerSocketId: string, ttlSeconds: number): Promise<ICallSession>;
    getSession(callId: string): Promise<ICallSession | null>;
    updateStatus(callId: string, status: CallStatus, ttlSeconds?: number): Promise<void>;
    setReceiverSocket(callId: string, receiverSocketId: string): Promise<void>;
    setSocketForUser(callId: string, userId: string, socketId: string): Promise<void>;
    getActiveCallId(userId: string): Promise<string | null>;
    getUserCallPartner(userId: string): Promise<string | null>;
    scheduleTimeout(callId: string, ms: number, onExpire: (callId: string) => void): void;
    clearTimeout(callId: string): void;
    cleanup(callId: string): Promise<void>;
}

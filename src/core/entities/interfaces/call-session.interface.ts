import type { CallStatus } from '@core/enum/call.enum';

export interface ICallSession {
  callId: string;
  callerId: string;
  receiverId: string;
  callerSocketId: string;
  receiverSocketId: string | null;
  status: CallStatus;
  createdAt: string;
  expiresAt: string;
}

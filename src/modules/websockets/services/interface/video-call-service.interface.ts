export interface IVideoCallService {
    getRoomKey(namespace: string, callerId: string, receiverId: string): string;
    addCallerAndReceiverToRoom(namespace: string, callerId: string, receiverId: string): Promise<string>;
    removeClientFromRoom(namespace: string, callerId: string, receiverId: string): Promise<string>;
    getRoomMembers(namespace: string, callerId: string, receiverId: string): Promise<string[]>;
    findRoomForClient(clientId: string, namespace: string): Promise<string | null>;
}
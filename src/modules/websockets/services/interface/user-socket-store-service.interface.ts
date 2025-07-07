export interface IUserSocketStoreService {
    addSocket(userId: string, socketId: string): Promise<void>;
    removeSocket(userId: string, socketId: string): Promise<void>;
    getsockets(userId: string): Promise<string[]>;
    hasSockets(userId: string): Promise<boolean>;
    removeAllSockets(userId: string): Promise<void>;
}
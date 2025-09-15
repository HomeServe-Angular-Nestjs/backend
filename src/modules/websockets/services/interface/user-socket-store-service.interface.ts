export interface IUserSocketStoreService {
    addSocket(userId: string, socketId: string, namespace: string): Promise<void>;
    removeSocket(userId: string, socketId: string, namespace: string): Promise<void>;
    getSockets(userId: string, namespace: string): Promise<string[]>;
    hasSockets(userId: string, namespace: string): Promise<boolean>;
    removeAllSockets(userId: string, namespace: string): Promise<void>;
    addToProviderRoom(providerId: string, customerId: string): Promise<void>;
    removeFromProviderRoom(providerId: string, customerId: string): Promise<void>;
}
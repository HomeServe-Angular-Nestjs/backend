export interface ISlotUtility {
    isAvailable(ruleId: string, dateISO: string, from: string, to: string): Promise<boolean>;
    reserve(ruleId: string, dateISO: string, from: string, to: string,): Promise<void>;
    release(ruleId: string, dateISO: string, from: string, to: string): Promise<void>;
    complete(ruleId: string, dateISO: string, from: string, to: string): Promise<void>;
    cancel(ruleId: string, dateISO: string, from: string, to: string): Promise<void>;
}
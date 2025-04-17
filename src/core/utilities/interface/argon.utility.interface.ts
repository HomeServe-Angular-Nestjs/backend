import { Options } from 'argon2';

export interface IArgonUtility {
  hash(data: string, options?: Options): Promise<string>;
  verify(hash: string, plain: string): Promise<boolean>;
  needsRehash(hash: string): boolean;
}

import { Injectable } from "@nestjs/common";
import { argon2id, hash, needsRehash, Options, verify } from "argon2";
import { IArgonUtility } from "../interface/argon.utility.interface";

@Injectable()
export class ArgonUtility implements IArgonUtility {
    private readonly defaultOptions: Options & { raw?: false } = {
        type: argon2id,
        timeCost: 3, // Number of iterations
        memoryCost: 65536, // 64MB memory usage
        parallelism: 1, // Number of threads
        hashLength: 32, // Output length in bytes
    }

    async hash(data: string, options?: Options): Promise<string> {
        return hash(data, {
            ...this.defaultOptions,
            ...options
        });
    }

    async verify(hash: string, plain: string): Promise<boolean> {
        return verify(hash, plain);
    }

    async needsRehash(hash: string): Promise<boolean> {
        return needsRehash(hash, this.defaultOptions);
    }
}
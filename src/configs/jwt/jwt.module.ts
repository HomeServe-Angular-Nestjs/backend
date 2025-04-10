import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        JwtModule.registerAsync({
            useFactory: (config: ConfigService) => {
                const secret = config.get<string>('JWT_ACCESS_SECRET');
                if (!secret) throw new Error('JWT_SECRET missing in env');

                return {
                    global: true,
                    secret: config.get<string>('JWT_ACCESS_SECRET') || (() => {
                        console.error('MISSING JWT_SECRET IN ENV');
                        throw new Error('JWT secret missing');
                    })(),
                    signOptions: {
                        expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN') || (() => {
                            console.error('MISSING JWT_SECRET IN ENV');
                            throw new Error('JWT secret missing');
                        })(),
                    }
                };
            },
            inject: [ConfigService],
        }),
    ],
    exports: [JwtModule]
})
export class JwtConfigModule { }
import { ICustomLogger } from "@core/logger/interface/custom-logger.interface";
import { ILoggerFactory, LOGGER_FACTORY } from "@core/logger/interface/logger-factory.interface";
import { Controller, Inject, Post } from "@nestjs/common";

interface IiceServer {
    urls: string | string[];
    username?: string;
    credential?: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

const TURN_URLS = [
    'turn:global.relay.metered.ca:80',
    'turn:global.relay.metered.ca:80?transport=tcp',
    'turn:global.relay.metered.ca:443',
    'turns:global.relay.metered.ca:443?transport=tcp',
];

@Controller('video-call')
export class VideoCallController {
    private readonly logger: ICustomLogger;
    private cache: { expiresAt: number; iceServers: IiceServer[] } | null = null;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
    ) {
        this.logger = this.loggerFactory.createLogger(VideoCallController.name);
    }

    @Post('turn-credentials')
    getTurnCredentials(): { iceServers: IiceServer[] } {
        if (this.cache && this.cache.expiresAt > Date.now()) {
            return { iceServers: this.cache.iceServers };
        }

        try {
            const iceServers = this._buildIceServers();
            this.cache = {
                expiresAt: Date.now() + CACHE_TTL_MS,
                iceServers,
            };
            return { iceServers };
        } catch (error) {
            this.logger.error('Failed to build ICE servers, falling back to STUN only', error);
            return { iceServers: [this._stunServer()] };
        }
    }

    private _stunServer(): IiceServer {
        return { urls: 'stun:stun.relay.metered.ca:80' };
    }

    private _buildIceServers(): IiceServer[] {
        const turnUsername = process.env.TURN_USERNAME;
        const turnPassword = process.env.TURN_PASSWORD;

        if (!turnUsername || !turnPassword) {
            this.logger.warn('TURN_USERNAME/TURN_PASSWORD not configured, serving STUN only');
            return [this._stunServer()];
        }

        const turnServers: IiceServer[] = TURN_URLS.map((url) => ({
            urls: url,
            username: turnUsername,
            credential: turnPassword,
        }));

        return [this._stunServer(), ...turnServers];
    }
}

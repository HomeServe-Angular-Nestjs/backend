import { BadRequestException, Body, Controller, Logger, Post, Req, UnauthorizedException } from "@nestjs/common";
import { CreateChatDto } from "../dto/chat.dto";
import { Request } from "express";
import { IPayload } from "src/core/misc/payload.interface";

@Controller('chat')
export class ChatController {
    private readonly logger = new Logger(ChatController.name);

    constructor() { }

    @Post('')
    async createChat(@Req() req: Request, @Body() dto: CreateChatDto) {
        try {
            const user = req.user as IPayload;
            const userType = req['userType'];
            if (!user.sub || userType) {
                throw new UnauthorizedException('User not found.')
            }

        } catch (err) {

        }
    }
}
import { Module } from "@nestjs/common";
import { ChatGateWay } from "./gateway/chat.gateway";
import { ChatController } from "./controller/chat.controller";

@Module({
    controllers: [ChatController],
    providers: [ChatGateWay],
})
export class ChatModule { }
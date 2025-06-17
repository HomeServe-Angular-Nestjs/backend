import { Module } from "@nestjs/common";
import { ChatGateWay } from "./gateway/chat.gateway";

@Module({
    providers: [ChatGateWay],
})
export class ChatModule { }
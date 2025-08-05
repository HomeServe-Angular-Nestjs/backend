import { SLOT_RULE_SERVICE } from "@core/constants/service.constant";
import { IPayload } from "@core/misc/payload.interface";
import { CreateRuleDto } from "@modules/slots/dtos/slot.rule.dto";
import { ISlotRuleService } from "@modules/slots/services/interfaces/slot-rule-service.interface";
import { Body, Controller, Get, Inject, Post, Req, } from "@nestjs/common";
import { Request } from "express";

@Controller('rule')
export class SlotRuleController {
    constructor(
        @Inject(SLOT_RULE_SERVICE)
        private readonly _slotRuleService: ISlotRuleService
    ) { }

    @Post()
    async createSlotRule(@Req() req: Request, @Body() dto: CreateRuleDto) {
        const user = req.user as IPayload;
        return this._slotRuleService.createRule(user.sub, dto);
    }

    @Get()
    async fetchRules(@Req() req: Request) {
        const user = req.user as IPayload;
        return await this._slotRuleService.fetchRules(user.sub);
    }
}
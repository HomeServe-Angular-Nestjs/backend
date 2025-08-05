import { SLOT_RULE_SERVICE } from "@core/constants/service.constant";
import { ErrorMessage } from "@core/enum/error.enum";
import { IPayload } from "@core/misc/payload.interface";
import { IResponse } from "@core/misc/response.util";
import { ChangeStatusDto, CreateRuleDto, PageDto } from "@modules/slots/dtos/slot.rule.dto";
import { ISlotRuleService } from "@modules/slots/services/interfaces/slot-rule-service.interface";
import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Req, } from "@nestjs/common";
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
        return await this._slotRuleService.createRule(user.sub, dto);
    }

    @Get()
    async fetchRules(@Req() req: Request, @Query() { page }: PageDto) {
        const user = req.user as IPayload;
        return await this._slotRuleService.fetchRules(user.sub, page);
    }

    @Patch('status')
    async updateStatus(@Req() req: Request, @Body() { status, ruleId }: ChangeStatusDto) {
        const user = req.user as IPayload;
        return await this._slotRuleService.updateStatus(user.sub, ruleId, status);
    }

    @Delete(':ruleId')
    async removeRule(@Req() req: Request, @Param('ruleId') ruleId: string): Promise<IResponse> {
        const user = req.user as IPayload;

        if (!user.sub || !ruleId) {
            throw new BadRequestException(ErrorMessage.MISSING_FIELDS);
        }

        return await this._slotRuleService.removeRule(user.sub, ruleId);
    }
}
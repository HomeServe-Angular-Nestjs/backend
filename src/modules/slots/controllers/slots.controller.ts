import { SLOT_RULE_SERVICE } from "@core/constants/service.constant";
import { ISlotRule } from "@core/entities/interfaces/slot-rule.entity.interface";
import { ErrorMessage } from "@core/enum/error.enum";
import { IPayload } from "@core/misc/payload.interface";
import { IResponse } from "@core/misc/response.util";
import { isValidIdPipe } from "@core/pipes/is-valid-id.pipe";
import { ChangeStatusDto, CreateRuleDto, DateDto, EditRuleDto, RuleFilterDto } from "@modules/slots/dtos/slot.rule.dto";
import { ISlotRuleService } from "@modules/slots/services/interfaces/slot-rule-service.interface";
import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query, Req, } from "@nestjs/common";
import { Request } from "express";

@Controller('rule')
export class SlotRuleController {
    constructor(
        @Inject(SLOT_RULE_SERVICE)
        private readonly _slotRuleService: ISlotRuleService
    ) { }

    @Post('')
    async createSlotRule(@Req() req: Request, @Body() dto: CreateRuleDto) {
        const user = req.user as IPayload;
        return await this._slotRuleService.createRule(user.sub, dto);
    }

    @Put(':ruleId')
    async editSlotRule(
        @Req() req: Request,
        @Param('ruleId', new isValidIdPipe()) ruleId: string,
        @Body() dto: EditRuleDto
    ): Promise<IResponse<ISlotRule>> {
        const user = req.user as IPayload;
        return await this._slotRuleService.editRule(user.sub, ruleId, dto);
    }

    @Get('')
    async fetchRules(@Req() req: Request, @Query() dto: RuleFilterDto) {
        const user = req.user as IPayload;
        return await this._slotRuleService.fetchRules(user.sub, dto);
    }

    @Patch('status')
    async updateStatus(@Req() req: Request, @Body() { status, ruleId }: ChangeStatusDto) {
        const user = req.user as IPayload;
        return await this._slotRuleService.updateStatus(user.sub, ruleId, status);
    }

    @Delete(':ruleId')
    async removeRule(
        @Req() req: Request,
        @Param('ruleId', new isValidIdPipe()) ruleId: string
    ): Promise<IResponse> {
        const user = req.user as IPayload;
        return await this._slotRuleService.removeRule(user.sub, ruleId);
    }

    @Get('available_slots/:providerId')
    async getAvailableSlots(
        @Param('providerId', new isValidIdPipe()) providerId: string,
        @Query() { date }: DateDto
    ): Promise<IResponse> {
        return await this._slotRuleService.getAvailableSlots(providerId, date);
    }
}
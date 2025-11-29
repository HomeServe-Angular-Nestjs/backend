import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query, Req, } from "@nestjs/common";
import { SLOT_RULE_SERVICE } from "@core/constants/service.constant";
import { ISlotRule } from "@core/entities/interfaces/slot-rule.entity.interface";
import { IPayload } from "@core/misc/payload.interface";
import { IResponse } from "@core/misc/response.util";
import { isValidIdPipe } from "@core/pipes/is-valid-id.pipe";
import { ChangeStatusDto, CreateRuleDto, DateDto, EditRuleDto, RuleFilterDto } from "@modules/slots/dtos/slot.rule.dto";
import { ISlotRuleService } from "@modules/slots/services/interfaces/slot-rule-service.interface";
import { Request } from "express";

@Controller('rule')
export class SlotRuleController {
    constructor(
        @Inject(SLOT_RULE_SERVICE)
        private readonly _slotRuleService: ISlotRuleService
    ) { }

    @Post('')
    async createSlotRule(@Req() req: Request, @Body() createRuleDto: CreateRuleDto) {
        const user = req.user as IPayload;
        return await this._slotRuleService.createRule(user.sub, createRuleDto);
    }

    @Put(':ruleId')
    async editSlotRule(@Req() req: Request, @Param('ruleId', new isValidIdPipe()) ruleId: string, @Body() editRuleDto: EditRuleDto): Promise<IResponse<ISlotRule>> {
        const user = req.user as IPayload;
        return await this._slotRuleService.editRule(user.sub, ruleId, editRuleDto);
    }

    @Get('')
    async fetchRules(@Req() req: Request, @Query() ruleFilterDto: RuleFilterDto) {
        const user = req.user as IPayload;
        return await this._slotRuleService.fetchRules(user.sub, ruleFilterDto);
    }

    @Patch('status')
    async updateStatus(@Req() req: Request, @Body() { status, ruleId }: ChangeStatusDto) {
        const user = req.user as IPayload;
        return await this._slotRuleService.updateStatus(user.sub, ruleId, status);
    }

    @Delete(':ruleId')
    async removeRule(@Req() req: Request, @Param('ruleId', new isValidIdPipe()) ruleId: string): Promise<IResponse> {
        const user = req.user as IPayload;
        return await this._slotRuleService.removeRule(user.sub, ruleId);
    }

    @Get('available_slots/:providerId')
    async getAvailableSlots(@Param('providerId', new isValidIdPipe()) providerId: string, @Query() { date }: DateDto): Promise<IResponse> {
        return await this._slotRuleService.getAvailableSlots(providerId, date);
    }
}
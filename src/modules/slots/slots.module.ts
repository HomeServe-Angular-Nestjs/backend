import { SlotRuleController } from "@modules/slots/controllers/slots.controller";
import { slotRepositoryProviders } from "@modules/slots/providers/slot-repository.providers";
import { slotServiceProviders } from "@modules/slots/providers/slot-service.providers";
import { Module } from "@nestjs/common";
import { SharedModule } from "@shared/shared.module";

@Module({
    imports: [SharedModule],
    controllers: [SlotRuleController],
    providers: [...slotServiceProviders, ...slotRepositoryProviders],
})
export class SlotModule { }
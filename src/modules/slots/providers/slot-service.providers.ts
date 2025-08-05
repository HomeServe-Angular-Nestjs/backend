import { SLOT_RULE_SERVICE } from "@core/constants/service.constant";
import { SlotRuleService } from "@modules/slots/services/implementation/slot-rule.service";
import { Provider } from "@nestjs/common";

export const slotServiceProviders: Provider[] = [
    {
        provide: SLOT_RULE_SERVICE,
        useClass: SlotRuleService
    }
]
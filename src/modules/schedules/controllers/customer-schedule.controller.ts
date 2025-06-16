import { Controller, Logger } from "@nestjs/common";

@Controller('schedule')
export class CustomerScheduleController {
    private readonly logger = new Logger(CustomerScheduleController.name);

    constructor() { }
}
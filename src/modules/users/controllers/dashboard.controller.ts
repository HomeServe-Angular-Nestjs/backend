import { Controller } from "@nestjs/common";
import { CustomLogger } from "src/core/logger/custom-logger";

@Controller()
export class AdminDashboardController {
    private readonly logger = new CustomLogger(AdminDashboardController.name);
    constructor() { }
}

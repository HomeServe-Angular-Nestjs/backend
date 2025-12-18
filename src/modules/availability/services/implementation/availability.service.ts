import { IAvailabilityService } from "@modules/availability/services/interface/availability-service.interface";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AvailabilityService implements IAvailabilityService {
    constructor() { }
}
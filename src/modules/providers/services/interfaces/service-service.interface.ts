import { CreateServiceDto, CreateSubServiceDto } from "../../dtos/service.dto";

export interface IServiceFeatureService {
    createService(dto: CreateServiceDto);
}
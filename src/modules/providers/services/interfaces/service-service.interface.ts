import { IPayload } from "../../../auth/misc/payload.interface";
import { CreateServiceDto, CreateSubServiceDto } from "../../dtos/service.dto";

export interface IServiceFeatureService {
    createService(dto: CreateServiceDto, user: IPayload): Promise<CreateSubServiceDto>;
}
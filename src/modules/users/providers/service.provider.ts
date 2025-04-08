import { Provider } from "@nestjs/common";
import { USER_SERVICE_NAME } from "../../../core/constants/service.constant";
import { UserService } from "../services/implementations/user.service";

export const userServiceProvider: Provider[] = [
    {
        provide: USER_SERVICE_NAME,
        useClass: UserService
    }
]
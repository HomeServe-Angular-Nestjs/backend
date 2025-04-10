import { Provider } from "@nestjs/common";
import { TOKEN_SERVICE_NAME, USER_SERVICE_NAME } from "../../../core/constants/service.constant";
import { UserService } from "../services/implementations/user.service";
import { TokenService } from "../../auth/services/implementations/token.service";

export const userServiceProvider: Provider[] = [
    {
        provide: USER_SERVICE_NAME,
        useClass: UserService
    },
    {
        provide: TOKEN_SERVICE_NAME,
        useClass: TokenService
    },
]

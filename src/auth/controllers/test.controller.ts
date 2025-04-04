import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { AuthInterceptor } from "../interceptors/auth.interceptor";

@Controller('test')
@UseInterceptors(AuthInterceptor)
export class TestController {

    @Get('profile')
    profile() {
        return { message: 'got in' }
    }
}
import { Body, Controller, Post } from "@nestjs/common";
import { InitialSignupDto } from "../dtos/signup.dto";
import { SignupService } from "../services/implementations/signup.service";

@Controller()
export class SignupController {

    constructor(private readonly signupService: SignupService) { }

    @Post('signup')
    sendOtp(@Body() dto: InitialSignupDto) {
        this.signupService.sendOtp(dto)
    }
}
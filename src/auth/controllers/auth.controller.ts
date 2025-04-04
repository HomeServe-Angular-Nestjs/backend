import { Controller, Get, NotFoundException, Req, } from "@nestjs/common";
import { Request } from "express";
import { UserType } from "../dtos/login.dto";

@Controller('auth')
export class AuthController {

    @Get('authenticate_user')
    async authenticateUser(@Req() req: Request) {
        try {
            const type = req.params.type as UserType;
            console.log('hello',type)
            // if (!type) {
            //     throw new NotFoundException('User type is missing');
            // }

            // const token = type

        } catch (err) {

        }
    }
}
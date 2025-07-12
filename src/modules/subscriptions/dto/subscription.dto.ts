import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { PlanRoleType, SubsDurationType, SubsPaymentStatus } from "src/core/enum/subscription.enum";

export class CreateSubscriptionDto {
    @IsNotEmpty()
    @IsString()
    planId: string;

    @IsNotEmpty()
    @IsString()
    transactionId: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(SubsDurationType))
    duration: SubsDurationType;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(PlanRoleType))
    role: PlanRoleType;

    @IsNotEmpty()
    @IsString({ each: true })
    features: string[];

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(SubsPaymentStatus))
    paymentStatus?: SubsPaymentStatus;

    @IsNotEmpty()
    @IsString()
    startTime: string;

    @IsNotEmpty()
    endDate: string | null;
}
import { Injectable } from "@nestjs/common";
import { IAdminRepository } from "../interfaces/admin-repo.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AdminDocument } from "../../schema/admin.schema";
import { ADMIN_MODEL_NAME } from "../../constants/model.constant";
import { BaseRepository } from "../../common/repositories/implementations/base.repository";
import { Admin } from "../../common/entities/implementation/admin.entity";

@Injectable()
export class AdminRepository extends BaseRepository<Admin, AdminDocument> implements IAdminRepository {
    constructor(@InjectModel(ADMIN_MODEL_NAME) private adminModel: Model<AdminDocument>) {
        super(adminModel);
    }

    protected toEntity(doc: AdminDocument): Admin {
        return new Admin({
            email: doc.email,
            password: doc.password,
        })
    }
}
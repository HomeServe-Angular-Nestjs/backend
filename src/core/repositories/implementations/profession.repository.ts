import { IProfessionRepository } from "@core/repositories/interfaces/profession-repo.interface";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../base/implementations/base.repository";
import { ProfessionDocument } from "@core/schema/profession.schema";
import { InjectModel } from "@nestjs/mongoose";
import { PROFESSION_MODEL_NAME } from "@core/constants/model.constant";
import { Model } from "mongoose";

@Injectable()
export class ProfessionRepository extends BaseRepository<ProfessionDocument> implements IProfessionRepository {
    constructor(
        @InjectModel(PROFESSION_MODEL_NAME)
        private readonly _professionModel: Model<ProfessionDocument>
    ) {
        super(_professionModel);
    }
}
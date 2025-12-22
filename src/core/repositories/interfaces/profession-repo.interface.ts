import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { ProfessionDocument } from "@core/schema/profession.schema";

export interface IProfessionRepository extends IBaseRepository<ProfessionDocument> {

}
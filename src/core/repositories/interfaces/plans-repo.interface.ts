import { IPlan } from "src/core/entities/interfaces/plans.entity.interface";
import { IBaseRepository } from "../base/interfaces/base-repo.interface";
import { PlanDocumentType } from "src/core/schema/plans.schema";

export interface IPlanRepository extends IBaseRepository<IPlan, PlanDocumentType> { }
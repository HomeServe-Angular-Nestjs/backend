import { Provider } from "../../entities/implementation/provider.entity";
import { IBaseRepository } from "../base/interfaces/base-repo.interface";
import { ProviderDocument } from "../../schema/provider.schema";

export interface IProviderRepository extends IBaseRepository<Provider, ProviderDocument> {

}
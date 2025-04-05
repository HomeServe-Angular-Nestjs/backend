import { Provider } from "../../common/entities/implementation/provider.entity";
import { IBaseRepository } from "../../common/repositories/interfaces/base-repo.interface";
import { ProviderDocument } from "../../schema/provider.schema";

export interface IProviderRepository extends IBaseRepository<Provider, ProviderDocument> {

}
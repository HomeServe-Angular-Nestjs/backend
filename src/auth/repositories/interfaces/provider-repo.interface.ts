import { Provider } from "src/auth/common/entities/implementation/provider.entity";
import { IBaseRepository } from "src/auth/common/repositories/interfaces/base-repo.interface";
import { ProviderDocument } from "src/auth/schema/provider.schema";

export interface IProviderRepository extends IBaseRepository<Provider, ProviderDocument> {

}
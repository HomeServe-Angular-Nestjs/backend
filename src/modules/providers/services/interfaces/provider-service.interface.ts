import { Provider } from "../../../../core/entities/implementation/provider.entity";

export interface IProviderServices { 
    getProviders():Promise<Provider[]>;
}
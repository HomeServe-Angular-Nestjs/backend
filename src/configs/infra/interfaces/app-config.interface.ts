import { IPricingConfig } from "@core/utilities/interface/pricing.utility.interface";
import { ITimeConfig } from "@core/utilities/interface/time.utility.interface";

export interface IAppConfig extends ITimeConfig, IPricingConfig { }
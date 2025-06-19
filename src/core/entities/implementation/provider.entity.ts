import { Address, Availability, IDoc, IExpertise, ILanguage, IProvider } from '../interfaces/user.entity.interface';
import { BaseUserEntity } from '../base/implementation/base-user.entity';
import { SlotType } from '../interfaces/schedule.entity.interface';

export class Provider extends BaseUserEntity implements IProvider {
  bio: string;
  isVerified: boolean;
  expertise: IExpertise[];
  additionalSkills: string[];
  languages: ILanguage[];
  location?: Address;
  workImages: string[];
  awards: string[];
  isCertified: boolean;
  docs: IDoc[];
  servicesOffered: string[] = [];
  schedules: string[];
  subscriptionID: string | null;
  profession: string;
  experience: number;
  availability: Availability;
  serviceRadius: number;
  defaultSlots: SlotType[];
  bookingLimit: number | null;
  bufferTime: number | null;
  enableSR: boolean;

  constructor(partial: Partial<Provider>) {
    super(partial);
    Object.assign(this, partial);
  }
}

import { Availability, IProvider } from '../interfaces/user.entity.interface';
import { BaseUserEntity } from '../base/implementation/base-user.entity';
import { ISubService } from '../interfaces/service.entity.interface';

export class Provider extends BaseUserEntity implements IProvider {
  bio: string;
  isVerified: boolean;
  expertise: {
    specialization: string;
    label: string;
    tag: string;
  }[];
  additionalSkills: string[];
  languages: string[];
  location: {
    street: string;
    city: string;
    state: string;
    zipcode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  workImages: string[];
  awards: string[];
  isCertified: boolean;
  verification: {
    pcc: {
      fileUrl: string;
      uploadedAt: Date;
    };
    additionalDocs: {
      type: string;
      fileUrl: string;
      uploadedAt: Date;
    }[];
    verificationStatus: boolean;
    verifiedAt: Date;
  };
  servicesOffered: string[] | ISubService[] = [];
  schedules: string[];
  subscriptionID: string | null;
  profession: string;
  experience: number;
  availability: Availability;
  serviceRadius: number;

  constructor(partial: Partial<Provider>) {
    super(partial);
    Object.assign(this, partial);
  }
}

import { SlotType } from '../../../modules/bookings/dtos/booking.dto';
import { BaseUserEntity } from '../base/implementation/base-user.entity';
import {
    Availability, IDoc, IExpertise, ILanguage, IProvider, IReview, VerificationStatusType
} from '../interfaces/user.entity.interface';

export class Provider extends BaseUserEntity implements IProvider {
  bio: string;
  verificationStatus: VerificationStatusType;
  expertise: IExpertise[];
  additionalSkills: string[];
  languages: ILanguage[];
  workImages: string[];
  awards: string[];
  isCertified: boolean;
  docs: IDoc[];
  servicesOffered: string[] = [];
  schedules: string[];
  profession: string;
  experience: number;
  availability: Availability;
  serviceRadius: number;
  defaultSlots: SlotType[];
  bookingLimit: number | null;
  bufferTime: number | null;
  enableSR: boolean;
  ratingCount: number;
  avgRating: number;
  reviews: IReview[];

  constructor(partial: Partial<Provider>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class Review {
  id: string;
  reviewedBy: string;
  desc: string;
  writtenAt: Date;
  isReported: boolean;

  constructor(review: Partial<Review>) {
    Object.assign(this, review);
  }
}
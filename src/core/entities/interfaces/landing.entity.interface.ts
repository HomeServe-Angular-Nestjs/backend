export interface ILandingStatistics {
  completedJobs: number;
  verifiedProviders: number;
  averageRating: number;
  totalCategories: number;
}

export interface ILandingCategory {
  categoryId: string;
  name: string;
  providerCount: number;
  startingPrice: number;
  avgRating: number;
  bookingCount: number;
}

export interface ILandingFeaturedProvider {
  id: string;
  fullname: string;
  username: string;
  avatar: string;
  profession: string;
  experience: number;
  address: string;
  isCertified: boolean;
  avgRating: number;
  reviewCount: number;
  completedJobs: number;
}

export interface ILandingTestimonial {
  customerName: string;
  customerAvatar: string;
  rating: number;
  text: string;
  serviceName: string;
  date: Date;
}

export interface ILandingData {
  statistics: ILandingStatistics;
  categories: ILandingCategory[];
  featuredProviders: ILandingFeaturedProvider[];
  testimonials: ILandingTestimonial[];
}

export interface ILandingSearchCategory {
  categoryId: string;
  categoryName: string;
}

import { v2 as Cloudinary } from 'cloudinary';

import { ConfigService } from '@nestjs/config';

export const CLOUDINARY = 'CLOUDINARY';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (config: ConfigService) => {
    const cloud_name = config.get<string>('CLOUDINARY_NAME');
    const api_key = config.get<string>('CLOUDINARY_KEY');
    const api_secret = config.get<string>('CLOUDINARY_SECRET');

    if (!cloud_name || !api_key || !api_secret) {
      throw new Error('Missing Cloudinary config in .env');
    }

    Cloudinary.config({ cloud_name, api_key, api_secret });

    return Cloudinary;
  },
  inject: [ConfigService],
};

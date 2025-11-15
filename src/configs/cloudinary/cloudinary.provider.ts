import { v2 as Cloudinary } from 'cloudinary';

import { ConfigService } from '@nestjs/config';

export const CLOUDINARY = 'CLOUDINARY';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (config: ConfigService) => {
    const cloud_name = config.get<string>('CLOUDINARY_NAME');
    console.warn('CLOUDINARY_NAME: ', cloud_name,)
    const api_key = config.get<string>('CLOUDINARY_KEY');
    console.warn('CLOUDINARY_KEY: ', api_key);
    const api_secret = config.get<string>('CLOUDINARY_SECRET');
    console.warn('CLOUDINARY_SECRET: ', api_secret)

    if (!cloud_name || !api_key || !api_secret) {
      throw new Error('Missing Cloudinary config in .env');
    }

    Cloudinary.config({ cloud_name, api_key, api_secret });

    return Cloudinary;
  },
  inject: [ConfigService],
};

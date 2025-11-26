import cookieParser from 'cookie-parser';
import session from 'express-session';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { SeedCommand } from '../seed/commands/seed.command';
import { SeedsModule } from '../seed/seed.module';
import { AppModule } from './app.module';
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { BlockGuard } from '@modules/auth/guards/block.guard';
import morgan from 'morgan';
import { ConfigService } from '@nestjs/config';
import { RedisIoAdapter } from '@configs/redis/redis-io-adaptor';

async function bootstrap() {
  if (process.argv.includes('seed:admin')) {
    const app = await NestFactory.createApplicationContext(SeedsModule, {
      logger: ['error', 'warn', 'log'],
    });

    try {
      const seedCommand = app.get(SeedCommand);
      await seedCommand.seedAdmin();
      console.log('✅ Seed command completed successfully');
    } catch (error) {
      console.error('❌ Seed command failed:', error);
      process.exit(1);
    } finally {
      await app.close();
      process.exit(0);
    }
  }

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const loggerFactory = app.get<ILoggerFactory>(LOGGER_FACTORY);
  // app.useWebSocketAdapter(new RedisIoAdapter(loggerFactory, app, configService));

  app.use(cookieParser());

  const ALLOWED_URLS: string[] = (process.env.ALLOWED_URLS || '')
    .split(',')
    .map(url => url.trim());

  ALLOWED_URLS.push('https://linking-blog-supervisors-acrylic.trycloudflare.com');


  app.enableCors({
    origin: ALLOWED_URLS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });


  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(morgan('dev'));

  app.setGlobalPrefix('api');

  const customerRepository = app.get<ICustomerRepository>(CUSTOMER_REPOSITORY_INTERFACE_NAME);
  const providerRepository = app.get<IProviderRepository>(PROVIDER_REPOSITORY_INTERFACE_NAME);
  app.useGlobalGuards(new BlockGuard(loggerFactory, customerRepository, providerRepository));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      exposeDefaultValues: true,
      enableImplicitConversion: true,
    }
  }));

  await app.listen(process.env.PORT ?? 5000);
}

bootstrap().catch(console.error);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { BlockGuard } from './modules/auth/guards/block.guard';
import { ICustomerRepository } from './core/repositories/interfaces/customer-repo.interface';
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from './core/constants/repository.constant';
import { IProviderRepository } from './core/repositories/interfaces/provider-repo.interface';
import { FRONTEND_URL } from './core/environments/environments';
import { SeedsModule } from '../seed/seed.module';
import { SeedCommand } from '../seed/commands/seed.command';

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

  app.use(cookieParser());

  // Configure cors options
  app.enableCors({
    origin: FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configure the session.
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.setGlobalPrefix('api');

  const customerRepository = app.get<ICustomerRepository>(CUSTOMER_REPOSITORY_INTERFACE_NAME);
  const providerRepository = app.get<IProviderRepository>(PROVIDER_REPOSITORY_INTERFACE_NAME);
  app.useGlobalGuards(new BlockGuard(customerRepository, providerRepository));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: false,
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

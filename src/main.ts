import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { SeedsModule } from './seed/seed.module';
import { SeedCommand } from './seed/commands/seed.command';

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
    origin: 'http://localhost:4200',
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

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      exposeDefaultValues: true,
      enableImplicitConversion: true,
    }
  }));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch(console.error);

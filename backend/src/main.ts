import 'dotenv/config';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const fields = validationErrors.reduce<Record<string, string[]>>(
          (accumulator, validationError) => {
            if (validationError.constraints) {
              accumulator[validationError.property] = Object.values(
                validationError.constraints,
              );
            }

            return accumulator;
          },
          {},
        );

        return new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Validation failed.',
          fields,
        });
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();

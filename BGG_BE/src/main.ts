import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// Production traffic reaches the API through the frontend's nginx (same origin),
// and the Vite dev server proxies /api, so CORS is only needed for direct
// cross-origin callers. List them in CORS_ORIGINS (comma-separated).
function corsOrigins(): string[] {
  const configured = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return configured?.length ? configured : ['http://localhost:5173'];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: corsOrigins(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000, process.env.HOST ?? '0.0.0.0');
}
await bootstrap();

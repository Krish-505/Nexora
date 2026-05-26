import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnvFiles } from './config/env';

async function bootstrap() {
  loadEnvFiles();

  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT || 3000);

  app.enableCors();

  await app.listen(port);
  console.log(`Nexora API listening on http://localhost:${port}`);
}

void bootstrap();

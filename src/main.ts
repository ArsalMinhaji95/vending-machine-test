import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
    }),
  );
  const config = app.get<ConfigService>(ConfigService);

  const documentConfig = new DocumentBuilder()
    .setTitle('Vending machine API Gateway')
    .setDescription('')
    // .addBearerAuth()
    // .addServer(
    //   `${config.get('GATEWAY_BASE_URI')}:${config.get('GATEWAY_PORT')}`,
    // )
    .addServer('http://localhost:3000')
    .setVersion('3.0')
    .build();

  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('api', app, document);
  app.enableCors();

  await app.listen(3000);
}
bootstrap();

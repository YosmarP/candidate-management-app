import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, BadRequestException  } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuración global de validación
   app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(error => 
        Object.values(error.constraints).join(', ')
      );
      return new BadRequestException(messages.join('; '));
    },
  }));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Candidate Management API')
    .setDescription('API para gestión de candidatos con procesamiento de Excel')
    .setVersion('1.0')
    .addTag('candidates')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Habilitar CORS para el frontend Angular
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
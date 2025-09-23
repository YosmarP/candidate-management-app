import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Importaciones de Candidates
import { CandidatesModule } from './candidates/candidates.module';
import { Candidate } from './candidates/entity/candidate.entity';

@Module({
  imports: [
    // Configuración de la base de datos SQLite
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Candidate],
      synchronize: true, // En producción cambiar por migraciones
      logging: true,
      retryAttempts: 3,
      retryDelay: 3000,
    }),

    // Módulos de la aplicación
    CandidatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
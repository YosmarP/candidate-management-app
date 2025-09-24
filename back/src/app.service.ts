import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '¡La API de Gestión de Candidatos está en ejecución!';
  }
}
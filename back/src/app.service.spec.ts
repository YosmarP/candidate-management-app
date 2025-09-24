import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('debería devolver el mensaje correcto', () => {
      expect(service.getHello()).toBe('¡La API de Gestión de Candidatos está en ejecución!');
    });
  });
});
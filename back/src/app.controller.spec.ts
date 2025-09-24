import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('debería devolver el mensaje de saludo', () => {
      const result = '¡La API de Gestión de Candidatos está en ejecución!';
      jest.spyOn(appService, 'getHello').mockReturnValue(result);

      expect(appController.getHello()).toBe(result);
    });
  });

  describe('getHealth', () => {
    it(' debería devolver el estado de salud', () => {
      const result = appController.getHealth();
      
      expect(result).toHaveProperty('status', 'OK');
      expect(result).toHaveProperty('service', 'Candidate Management API');
      expect(result).toHaveProperty('timestamp');
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { CandidateController } from './candidate.controller';
import { CandidateService } from '../services/candidate.service';
import { BadRequestException } from '@nestjs/common';

describe('CandidateController', () => {
  let controller: CandidateController;
  let candidateService: CandidateService;

  const mockCandidateService = {
    processCandidate: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockCandidate = {
    id: 1,
    name: 'Juan',
    surname: 'Perez',
    seniority: 'junior',
    yearsOfExperience: 2,
    availability: true,
    createdAt: new Date(),
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'excelFile',
    originalname: 'test.xlsx',
    encoding: '7bit',
    mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from('test'),
    size: 1024,
    destination: '',
    filename: '',
    path: '',
    stream: null,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidateController],
      providers: [
        {
          provide: CandidateService,
          useValue: mockCandidateService,
        },
      ],
    }).compile();

    controller = module.get<CandidateController>(CandidateController);
    candidateService = module.get<CandidateService>(CandidateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un candidato con éxito', async () => {
      const createDto = { name: 'Juan', surname: 'Perez' };
      
      mockCandidateService.processCandidate.mockResolvedValue(mockCandidate);

      const result = await controller.create(createDto, mockFile);

      expect(candidateService.processCandidate).toHaveBeenCalledWith({
        name: 'Juan',
        surname: 'Perez',
        excelFile: mockFile.buffer,
      });
      expect(result).toEqual(mockCandidate);
    });

    it('debería lanzar BadRequestException cuando el servicio falla', async () => {
      const createDto = { name: 'Juan', surname: 'Perez' };
      
      mockCandidateService.processCandidate.mockRejectedValue(
        new BadRequestException('Error processing Excel')
      );

      await expect(controller.create(createDto, mockFile)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('debería devolver todos los candidatos', async () => {
      const candidates = [mockCandidate];
      mockCandidateService.findAll.mockResolvedValue(candidates);

      const result = await controller.findAll();

      expect(candidateService.findAll).toHaveBeenCalled();
      expect(result).toEqual(candidates);
    });
  });

  describe('findOne', () => {
    it('debería devolver un candidato por id', async () => {
      mockCandidateService.findOne.mockResolvedValue(mockCandidate);

      const result = await controller.findOne(1);

      expect(candidateService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCandidate);
    });

    it('debería lanzar BadRequestException cuando no se encuentra el candidato', async () => {
      mockCandidateService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(999)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('debería eliminar un candidato con éxito', async () => {
      mockCandidateService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(candidateService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Candidato con ID 1 eliminado exitosamente' });
    });

    it('debería lanzar BadRequestException cuando la eliminación falla', async () => {
      mockCandidateService.remove.mockRejectedValue(
        new BadRequestException('Candidate not found')
      );

      await expect(controller.remove(999)).rejects.toThrow(BadRequestException);
    });
  });
});
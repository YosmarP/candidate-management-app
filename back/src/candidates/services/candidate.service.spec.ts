import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { ExcelParserService } from './excel-parser.service';
import { Candidate } from '../entity/candidate.entity';

describe('CandidateService', () => {
  let service: CandidateService;
  let candidateRepository: Repository<Candidate>;
  let excelParserService: ExcelParserService;

  const mockCandidateRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockExcelParserService = {
    parseExcel: jest.fn(),
  };

  const mockCandidate: Candidate = {
    id: 1,
    name: 'Juan',
    surname: 'Perez',
    seniority: 'junior',
    yearsOfExperience: 2,
    availability: true,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidateService,
        {
          provide: getRepositoryToken(Candidate),
          useValue: mockCandidateRepository,
        },
        {
          provide: ExcelParserService,
          useValue: mockExcelParserService,
        },
      ],
    }).compile();

    service = module.get<CandidateService>(CandidateService);
    candidateRepository = module.get<Repository<Candidate>>(getRepositoryToken(Candidate));
    excelParserService = module.get<ExcelParserService>(ExcelParserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processCandidate', () => {
    it('debería procesar un candidato con éxito', async () => {
      const candidateData = {
        name: 'Juan',
        surname: 'Perez',
        excelFile: Buffer.from('excel content'),
      };

      const excelData = {
        seniority: 'junior' as const,
        yearsOfExperience: 2,
        availability: true,
      };

      mockExcelParserService.parseExcel.mockReturnValue(excelData);
      mockCandidateRepository.create.mockReturnValue(mockCandidate);
      mockCandidateRepository.save.mockResolvedValue(mockCandidate);

      const result = await service.processCandidate(candidateData);

      expect(excelParserService.parseExcel).toHaveBeenCalledWith(candidateData.excelFile);
      expect(candidateRepository.create).toHaveBeenCalledWith({
        name: candidateData.name,
        surname: candidateData.surname,
        ...excelData,
      });
      expect(candidateRepository.save).toHaveBeenCalledWith(mockCandidate);
      expect(result).toEqual(mockCandidate);
    });

    it('debería lanzar BadRequestException cuando falle el parseo de Excel', async () => {
      const candidateData = {
        name: 'Juan',
        surname: 'Perez',
        excelFile: Buffer.from('invalid excel'),
      };

      mockExcelParserService.parseExcel.mockImplementation(() => {
        throw new Error('Invalid Excel file');
      });

      await expect(service.processCandidate(candidateData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('debería devolver todos los candidatos ordenados por fecha de creación', async () => {
      const candidates = [mockCandidate, { ...mockCandidate, id: 2 }];
      mockCandidateRepository.find.mockResolvedValue(candidates);

      const result = await service.findAll();

      expect(candidateRepository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
      expect(result).toEqual(candidates);
    });

    it('debería devolver un array vacío cuando no existan candidatos', async () => {
      mockCandidateRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debería devolver un candidato por id', async () => {
      mockCandidateRepository.findOne.mockResolvedValue(mockCandidate);

      const result = await service.findOne(1);

      expect(candidateRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockCandidate);
    });

    it('debería devolver null cuando no se encuentre el candidato', async () => {
      mockCandidateRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debería eliminar un candidato con éxito', async () => {
      mockCandidateRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(candidateRepository.delete).toHaveBeenCalledWith(1);
    });

    it('debería lanzar BadRequestException cuando no se encuentre el candidato', async () => {
      mockCandidateRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(BadRequestException);
    });
  });
});
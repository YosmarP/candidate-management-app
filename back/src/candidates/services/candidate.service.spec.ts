import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CandidateService } from './candidate.service';
import { ExcelParserService } from './excel-parser.service';
import { Candidate } from '../entity/candidate.entity';

describe('Servicio de Candidatos', () => {
  let service: CandidateService;
  let mockRepository: any;
  let mockExcelParser: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn()
    };

    mockExcelParser = {
      parseExcel: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidateService,
        { provide: getRepositoryToken(Candidate), useValue: mockRepository },
        { provide: ExcelParserService, useValue: mockExcelParser }
      ],
    }).compile();

    service = module.get<CandidateService>(CandidateService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('Procesamiento de candidatos', () => {
    it('guarda un candidato tras procesar su archivo Excel', async () => {
      const excelData = {
        seniority: 'junior' as const,
        yearsOfExperience: 2,
        availability: true
      };

      const candidateDto = {
        name: 'John',
        surname: 'Doe',
        excelFile: Buffer.from('test')
      };

      const savedCandidate = {
        id: 1,
        ...candidateDto,
        ...excelData,
        createdAt: new Date()
      };

      mockExcelParser.parseExcel.mockReturnValue(excelData);
      mockRepository.create.mockReturnValue(savedCandidate);
      mockRepository.save.mockResolvedValue(savedCandidate);

      const result = await service.processCandidate(candidateDto);

      expect(result).toEqual(savedCandidate);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CandidatesModule } from './candidates.module';
import { Candidate } from './entity/candidate.entity';
import { ExcelParserService } from './services/excel-parser.service';

describe('CandidatesController (e2e)', () => {
  let app: INestApplication;
  let candidateRepository: Repository<Candidate>;
  let excelParserService: ExcelParserService;

  const mockExcelBuffer = Buffer.from('mock excel content');
  const mockExcelData = {
    seniority: 'junior' as const,
    yearsOfExperience: 3,
    availability: true,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Proveer una base de datos sqlite en memoria para tests e2e
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Candidate],
          synchronize: true,
          logging: false,
        }),
        // Aseguramos que el repositorio de Candidate esté registrado
        TypeOrmModule.forFeature([Candidate]),
        CandidatesModule,
      ],
    })
    .overrideProvider(ExcelParserService)
    .useValue({
      parseExcel: jest.fn().mockReturnValue(mockExcelData),
    })
    .compile();

    app = moduleFixture.createNestApplication();

    // Pipes globales tal como en la app real
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await app.init();

    candidateRepository = moduleFixture.get<Repository<Candidate>>(getRepositoryToken(Candidate));
    excelParserService = moduleFixture.get<ExcelParserService>(ExcelParserService);
  });

  beforeEach(async () => {
    // limpiar la tabla entre tests
    await candidateRepository.clear();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('GET /candidates', () => {
    it('/candidates (GET) - should return empty array initially', async () => {
      return request(app.getHttpServer())
        .get('/candidates')
        .expect(200)
        .expect([]);
    });
  });

  describe('POST /candidates', () => {
    it('should create a new candidate successfully', async () => {
      const candidateData = { name: 'Juan', surname: 'Perez' };

      const res = await request(app.getHttpServer())
        .post('/candidates')
        .field('name', candidateData.name)
        .field('surname', candidateData.surname)
        .attach('excelFile', mockExcelBuffer, 'test.xlsx')
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(candidateData.name);
      expect(res.body.surname).toBe(candidateData.surname);
      expect(res.body.seniority).toBe(mockExcelData.seniority);
      expect(res.body.yearsOfExperience).toBe(mockExcelData.yearsOfExperience);
      expect(res.body.availability).toBe(mockExcelData.availability);
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should return 400 when name is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/candidates')
        .field('surname', 'Perez')
        .attach('excelFile', mockExcelBuffer, 'test.xlsx')
        .expect(400);

      expect(res.body.message).toContain('El nombre no debe estar vacío');
    });

    it('should return 400 when surname is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/candidates')
        .field('name', 'Juan')
        .attach('excelFile', mockExcelBuffer, 'test.xlsx')
        .expect(400);

      expect(res.body.message).toContain('El apellido no debe estar vacío');
    });

    it('should return 400 when Excel file is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/candidates')
        .field('name', 'Juan')
        .field('surname', 'Perez')
        .expect(400);

      expect(res.body.message).toContain('Archivo inválido');
    });

    it('should return 400 when Excel file is invalid', async () => {
      jest.spyOn(excelParserService, 'parseExcel').mockImplementation(() => {
        throw new Error('Invalid Excel file');
      });

      const res = await request(app.getHttpServer())
        .post('/candidates')
        .field('name', 'Juan')
        .field('surname', 'Perez')
        .attach('excelFile', mockExcelBuffer, 'test.xlsx')
        .expect(400);

      expect(res.body.message).toContain('Invalid Excel file');
    });

    it('should return 400 when name is too short', async () => {
      const res = await request(app.getHttpServer())
        .post('/candidates')
        .field('name', 'J') // demasiado corto
        .field('surname', 'Perez')
        .attach('excelFile', mockExcelBuffer, 'test.xlsx')
        .expect(400);

      expect(res.body.message).toContain('El nombre debe tener al menos 2 caracteres');
    });
  });
});

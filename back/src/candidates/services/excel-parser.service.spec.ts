import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ExcelParserService } from './excel-parser.service';
import * as XLSX from 'xlsx';

// Mock completo de XLSX
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}));

describe('ExcelParserService', () => {
  let service: ExcelParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExcelParserService],
    }).compile();

    service = module.get<ExcelParserService>(ExcelParserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseExcel', () => {
    it('debería parsear correctamente un archivo Excel válido', () => {
      const mockBuffer = Buffer.from('test');
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      };
      const mockData = [
        {
          Seniority: 'junior',
          'Years of experience': 3,
          Availability: true,
        },
      ];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const result = service.parseExcel(mockBuffer);

      expect(result).toEqual({
        seniority: 'junior',
        yearsOfExperience: 3,
        availability: true,
      });
    });

    it('debería lanzar un error si el archivo Excel está vacío', () => {
      const mockBuffer = Buffer.from('test');
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      };

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([]);

      expect(() => service.parseExcel(mockBuffer)).toThrow(BadRequestException);
    });

    it('debería lanzar un error si la seniority es inválida', () => {
      const mockBuffer = Buffer.from('test');
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      };
      const mockData = [
        {
          Seniority: 'invalid',
          'Years of experience': 3,
          Availability: true,
        },
      ];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      expect(() => service.parseExcel(mockBuffer)).toThrow(BadRequestException);
    });

    it('debería lanzar un error si los años de experiencia son negativos', () => {
      const mockBuffer = Buffer.from('test');
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      };
      const mockData = [
        {
          Seniority: 'junior',
          'Years of experience': -1,
          Availability: true,
        },
      ];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      expect(() => service.parseExcel(mockBuffer)).toThrow(BadRequestException);
    });   
     it('debería lanzar un error para un valor booleano inválido', () => {
      const mockBuffer = Buffer.from('test');
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      };
      const mockData = [
        {
          Seniority: 'junior',
          'Years of experience': 3,
          Availability: 'maybe', // Valor booleano inválido
        },
      ];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      expect(() => service.parseExcel(mockBuffer)).toThrow(BadRequestException);
      expect(() => service.parseExcel(mockBuffer)).toThrow('valor booleano');
    });
  });

  describe('parseExcel - Casos límite y valores nulos', () => {
    it('debería manejar valores null en las columnas', () => {
      const mockBuffer = Buffer.from('test');
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      };
      const mockData = [
        {
          Seniority: null, // Valor nulo
          'Years of experience': null,
          Availability: null,
        },
      ];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      expect(() => service.parseExcel(mockBuffer)).toThrow(BadRequestException);
    });

    it('debería manejar valores undefined en las columnas', () => {
      const mockBuffer = Buffer.from('test');
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      };
      const mockData = [
        {
          Seniority: undefined, // Valor undefined
          'Years of experience': undefined,
          Availability: undefined,
        },
      ];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      expect(() => service.parseExcel(mockBuffer)).toThrow(BadRequestException);
    });

    it('debería manejar valores de cadena vacía', () => {
      const mockBuffer = Buffer.from('test');
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      };
      const mockData = [
        {
          Seniority: '', // String vacío
          'Years of experience': '',
          Availability: '',
        },
      ];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      expect(() => service.parseExcel(mockBuffer)).toThrow(BadRequestException);
    });

    it('debería manejar un Excel con múltiples filas (debería usar solo la primera fila)', () => {
      const mockBuffer = Buffer.from('test');
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      };
      const mockData = [
        {
          Seniority: 'junior',
          'Years of experience': 2,
          Availability: true,
        },
        {
          Seniority: 'senior', // Segunda fila - debería ser ignorada
          'Years of experience': 5,
          Availability: false,
        },
      ];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const result = service.parseExcel(mockBuffer);

      // Debería usar solo la primera fila
      expect(result.seniority).toBe('junior');
      expect(result.yearsOfExperience).toBe(2);
      expect(result.availability).toBe(true);
    });

    it('debería manejar un número muy grande de años de experiencia', () => {
      const mockBuffer = Buffer.from('test');
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      };
      const mockData = [
        {
          Seniority: 'senior',
          'Years of experience': 50, // Valor alto
          Availability: true,
        },
      ];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const result = service.parseExcel(mockBuffer);

      expect(result.yearsOfExperience).toBe(50);
    });

    it('debería redondear los años de experiencia con decimales', () => {
      const mockBuffer = Buffer.from('test');
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      };
      const mockData = [
        {
          Seniority: 'junior',
          'Years of experience': 2.7, // Decimal
          Availability: true,
        },
      ];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const result = service.parseExcel(mockBuffer);

      expect(result.yearsOfExperience).toBe(3); // Redondeado
    });   
  });
});
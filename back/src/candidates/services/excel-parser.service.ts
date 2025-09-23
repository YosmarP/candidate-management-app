import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';

export interface ExcelCandidateData {
  seniority: 'junior' | 'senior';
  yearsOfExperience: number;
  availability: boolean;
}

@Injectable()
export class ExcelParserService {
  parseExcel(buffer: Buffer): ExcelCandidateData {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      if (workbook.SheetNames.length === 0) {
        throw new BadRequestException('El archivo Excel no contiene hojas');
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];      
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      if (data.length === 0) {
        throw new BadRequestException('El archivo Excel está vacío');
      }

      // Tomar la primera fila como datos del candidato
      const firstRow = data[0] as any;
      
      // Validar estructura del archivo Excel
      this.validateExcelRow(firstRow);
      
      return {
        seniority: this.validateSeniority(firstRow.Seniority || firstRow.seniority),
        yearsOfExperience: this.validateYears(firstRow['Years of experience'] || firstRow.yearsOfExperience || firstRow.years),
        availability: this.validateAvailability(firstRow.Availability || firstRow.availability)
      };
      
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error leyendo el archivo Excel: ' + error.message);
    }
  }

  private validateExcelRow(row: any): void {
    const requiredFields = ['Seniority', 'Years of experience', 'Availability'];
    const missingFields = requiredFields.filter(field => !row[field]);
    
    if (missingFields.length > 0) {
      throw new BadRequestException(
        `El archivo Excel debe contener las columnas: ${requiredFields.join(', ')}. ` +
        `Faltan: ${missingFields.join(', ')}`
      );
    }
  }

  private validateSeniority(seniority: string): 'junior' | 'senior' {
    // Validar el valor de seniority
    if (!seniority) {
      throw new BadRequestException('La columna Seniority es requerida');
    }
    
    const normalized = seniority.toLowerCase().trim();
    if (normalized !== 'junior' && normalized !== 'senior') {
      throw new BadRequestException('Seniority debe ser "junior" o "senior"');
    }
    
    return normalized as 'junior' | 'senior';
  }

  private validateYears(years: any): number {
    // Validar y convertir años de experiencia
    if (years === undefined || years === null) {
      throw new BadRequestException('La columna Years of experience es requerida');
    }
    
    const yearsNumber = Number(years);
    if (isNaN(yearsNumber) || yearsNumber < 0) {
      throw new BadRequestException('Years of experience debe ser un número positivo');
    }
    
    return Math.round(yearsNumber); 
  }

  private validateAvailability(availability: any): boolean {
    if (availability === undefined || availability === null) {
      throw new BadRequestException('La columna Availability es requerida');
    }
    
    // Convertir diferentes formatos a booleano
    if (typeof availability === 'boolean') return availability;
    if (typeof availability === 'number') return availability !== 0;
    if (typeof availability === 'string') {
      const normalized = availability.toLowerCase().trim();
      if (normalized === 'true' || normalized === 'yes' || normalized === '1' || normalized === 'si') return true;
      if (normalized === 'false' || normalized === 'no' || normalized === '0' || normalized === 'no') return false;
    }
    
    throw new BadRequestException('Availability debe ser un valor booleano (true/false)');
  }
}
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../entity/candidate.entity';
import { ExcelParserService } from './excel-parser.service';

export interface CreateCandidateData {
  name: string;
  surname: string;
  excelFile: Buffer;
}

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    private excelParserService: ExcelParserService,
  ) {}

  async processCandidate(candidateData: CreateCandidateData): Promise<Candidate> {
    try {
      const excelData = this.excelParserService.parseExcel(candidateData.excelFile);
      
      const candidate = this.candidateRepository.create({
        name: candidateData.name,
        surname: candidateData.surname,
        seniority: excelData.seniority,
        yearsOfExperience: excelData.yearsOfExperience,
        availability: excelData.availability
      });

      return await this.candidateRepository.save(candidate);
      
    } catch (error) {
      throw new BadRequestException(`Error procesando candidato: ${error.message}`);
    }
  }

  async findAll(): Promise<Candidate[]> {
    return this.candidateRepository.find({ 
      order: { createdAt: 'DESC' } 
    });
  }

  async findOne(id: number): Promise<Candidate> {
    return this.candidateRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    const result = await this.candidateRepository.delete(id);
    if (result.affected === 0) {
      throw new BadRequestException(`Candidato con ID ${id} no encontrado`);
    }
  }
}
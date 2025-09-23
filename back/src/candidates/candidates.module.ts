import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateController } from './controller/candidate.controller';
import { CandidateService } from './services/candidate.service';
import { ExcelParserService } from './services/excel-parser.service';
import { Candidate } from './entity/candidate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidate]),
  ],
  controllers: [CandidateController],
  providers: [CandidateService, ExcelParserService],
  exports: [CandidateService],
})
export class CandidatesModule {}
import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Body, 
  Param, 
  UseInterceptors, 
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { CandidateService } from '../services/candidate.service';
import { Candidate } from '../entity/candidate.entity';
import { CreateCandidateDto, CreateCandidateResponseDto } from '../dto/create-candidate.dto';

@ApiTags('candidates')
@Controller('candidates')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Post()
  @UseInterceptors(FileInterceptor('excelFile'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Crear un nuevo candidato con archivo Excel',
    type: CreateCandidateDto,
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Candidato creado exitosamente', 
    type: CreateCandidateResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async create(
    @Body() createCandidateDto: CreateCandidateDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: 
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|application/vnd.ms-excel' 
          }),
        ],
        exceptionFactory: (error) => {
          throw new BadRequestException(`Archivo inválido: ${error}`);
        },
      }),
    )
    excelFile: Express.Multer.File,
  ): Promise<Candidate> {
    try {
      return await this.candidateService.processCandidate({
        name: createCandidateDto.name,
        surname: createCandidateDto.surname,
        excelFile: excelFile.buffer
      });
    } catch (error) {
      throw new BadRequestException(`Error procesando el archivo: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los candidatos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de candidatos obtenida exitosamente', 
    type: [CreateCandidateResponseDto] 
  })
  async findAll(): Promise<Candidate[]> {
    return this.candidateService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener candidato por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del candidato' })
  @ApiResponse({ 
    status: 200, 
    description: 'Candidato encontrado', 
    type: CreateCandidateResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Candidato no encontrado' })
  async findOne(@Param('id') id: number): Promise<Candidate> {
    const candidate = await this.candidateService.findOne(id);
    if (!candidate) {
      throw new BadRequestException(`Candidato con ID ${id} no encontrado`);
    }
    return candidate;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar candidato' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del candidato a eliminar' })
  @ApiResponse({ status: 200, description: 'Candidato eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Candidato no encontrado' })
  async remove(@Param('id') id: number): Promise<{ message: string }> {
    await this.candidateService.remove(id);
    return { message: `Candidato con ID ${id} eliminado exitosamente` };
  }
}
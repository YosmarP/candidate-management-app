import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateCandidateDto {
  @ApiProperty({
    description: 'Nombre del candidato',
    example: 'John',
    required: true
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no debe estar vacío' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Apellido del candidato',
    example: 'Doe',
    required: true
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido no debe estar vacío' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  surname: string;
}

export class CreateCandidateResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John' })
  name: string;

  @ApiProperty({ example: 'Doe' })
  surname: string;

  @ApiProperty({ example: 'junior', enum: ['junior', 'senior'] })
  seniority: string;

  @ApiProperty({ example: 6 })
  yearsOfExperience: number;

  @ApiProperty({ example: true })
  availability: boolean;

  @ApiProperty({ example: '2023-09-23T10:30:00.000Z' })
  createdAt: Date;
}
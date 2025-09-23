import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateCandidateDto {
  @ApiProperty({
    description: 'Nombre del candidato',
    example: 'John',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Apellido del candidato',
    example: 'Doe',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
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
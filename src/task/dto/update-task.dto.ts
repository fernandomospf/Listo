import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';

export class UpdateTaskDto {
  @ApiProperty({ required: false, description: 'Título da task' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false, description: 'Descrição da task' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Status da task',
    enum: ['new', 'in_progress', 'done']
  })
  @IsEnum(['new', 'in_progress', 'done'])
  @IsOptional()
  status?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Prioridade da task (1: low, 2: medium, 3: high, 4: urgent)',
    minimum: 1,
    maximum: 4
  })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiProperty({ required: false, description: 'Data limite da task', type: String, format: 'date-time' })
  @IsDateString()
  @IsOptional()
  due_date?: Date;

  @ApiProperty({ required: false, description: 'URL de referência da task' })
  @IsString()
  @IsOptional()
  source_url?: string;
}
import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsString, IsDate, IsOptional, IsEnum, IsDateString } from "class-validator";
import { Type } from "class-transformer";

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TaskStatus {
  NEW = 'new',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export class CreateTaskDto {
  @ApiProperty({ 
    example: 'NextJS',
    description: 'Título da task'
  })
  @IsString()
  title: string

  @ApiProperty({ 
    example: 'teste criar front end',
    description: 'Descrição detalhada da task'
  })
  @IsString()
  description: string

  @ApiProperty({ 
    enum: TaskStatus,
    example: TaskStatus.PENDING,
    description: 'Status da task'
  })
  @IsEnum(TaskStatus)
  status: TaskStatus

  @ApiProperty({ 
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    description: 'Prioridade da task'
  })
  @IsEnum(TaskPriority)
  priority: TaskPriority

  @ApiProperty({ 
    example: '2025-10-30T23:59:59Z',
    description: 'Data de vencimento da task',
    nullable: true,
    required: false
  })
  @IsOptional()
  @IsDateString()
  due_date?: string

  @ApiProperty({ 
    example: 'https://github.com/fernandomosp/listo',
    description: 'URL de referência para a task',
    nullable: true,
    required: false
  })
  @IsOptional()
  @IsString()
  source_url?: string
}

export class ListTaskResponse {
    @ApiProperty({ example: '13d7f17f-4a91-40ff-82cf-e009a32e096e' })
    @IsString()
    id: string

    @ApiProperty({ example: 'a23c93c9-ea7b-4131-8f9f-2197efaee949' })
    @IsString()
    user_id: string

    @ApiProperty({ example: 'Teste de nova criação' })
    @IsString()
    title: string

    @ApiProperty({ example: 'Exemplo de descrição' })
    @IsString()
    description: string

    @ApiProperty({ example: 'new' })
    @IsString()
    status: string

    @ApiProperty({ example: 1 })
    @IsNumber()
    priority: number
    
    @ApiProperty({ 
        example: null,
        nullable: true 
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    due_date: Date | null

    @ApiProperty({ 
        example: null,
        nullable: true 
    })
    @IsOptional()
    @IsString()
    source_url: string | null

    @ApiProperty({ 
        example: null,
        nullable: true 
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    completed_at: Date | null

    @ApiProperty({ example: '2025-10-25T17:16:21.265783+00:00' })
    @Type(() => Date)
    @IsDate()
    created_at: Date

    @ApiProperty({ example: '2025-10-25T17:16:21.265783+00:00' })
    @Type(() => Date)
    @IsDate()
    updated_at: Date

    @ApiProperty({ 
        example: '2025-10-25T17:16:21.265783+00:00',
        nullable: true 
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    archived_at: Date | null

    @ApiProperty({ 
        example: null,
        nullable: true 
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    deleted_at: Date | null
}
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { User } from '../auth/user.decorator';
import { TasksService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ListTaskResponse } from './dto/list-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly svc: TasksService) { }

  @Get('/list')
  @ApiOperation({ summary: 'Listar todas as tasks do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tasks retornada com sucesso',
    type: ListTaskResponse,
    isArray: true
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  list(@User() user: any) {
    return this.svc.list(user.sub as string);
  }

  @Get(':taskId')
  getById(
    @User() user: any,
    @Param('taskId') taskId: string
  ) {
    return this.svc.getBydId(user.sub as string, taskId)
  }

  @Get('/list/completed')
  listCompleted(
    @User() user: any
  ){
    return this.svc.listCompleted(user.sub as string);
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova task' })
  @ApiResponse({
    status: 201,
    description: 'Task criada com sucesso',
    type: ListTaskResponse
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      example: {
        error: 'Dados inválidos',
        message: ['title must be a string', 'priority must be one of: low, medium, high'],
        code: 'VALIDATION_ERROR'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
    schema: {
      example: {
        error: 'Não autorizado',
        message: 'Token de autenticação inválido',
        code: 'UNAUTHORIZED'
      }
    }
  })
  @ApiBody({
    type: CreateTaskDto,
    examples: {
      example1: {
        summary: 'Exemplo de criação de task',
        value: {
          title: 'NextJS',
          description: 'teste criar front end',
          status: 'pending',
          priority: 'high',
          due_date: '2025-10-30T23:59:59Z',
          source_url: 'https://github.com/fernandomosp/listo'
        }
      },
      example2: {
        summary: 'Exemplo mínimo',
        value: {
          title: 'Task simples',
          description: 'Descrição básica',
          status: 'new',
          priority: 'medium'
        }
      }
    }
  })
  create(@User() user: any, @Body() dto: CreateTaskDto) {
    return this.svc.create(user.sub as string, dto);
  }

  @Put('/completed/:taskId')
  completeTask(@User() user: any, @Param('taskId') taskId: string) {
    return this.svc.completeTask(user.sub as string, taskId)
  }

  @Put(':taskId')
  async update(
    @User() user: any,
    @Body() dto: UpdateTaskDto,
    @Param('taskId') taskId: string
  ) {
    const response = await this.svc.update(taskId, user.sub, dto);
    return response;
  }

  @Delete('/delete/:taskId')
  @ApiOperation({ summary: 'Deleta uma task' })
  @ApiResponse({
    status: 204,
    description: 'no content',
  })
  @HttpCode(204)
  async delete(@User() user: any, @Param('taskId') taskId: string) {
    await this.svc.delete(user.sub, taskId);
  }
}


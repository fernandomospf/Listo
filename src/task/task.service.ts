import { ForbiddenException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateTaskDto } from './dto/update-task.dto';

type CreateTaskInput = { title: string; description?: string, due_date?: Date, status?: number };

@Injectable()
export class TasksService {
  constructor(private readonly supa: SupabaseService) { }

  async list(userId: string) {
    const { data, error } = await this.supa.db
      .from('task')
      .select('*')
      .eq('user_id', userId)
      .is('completed_at', null)
      .order('created_at', { ascending: false });

    if (error) throw this.asForbidden(error);
    return data ?? [];
  }

  async listCompleted(userId: string) {
    const {data, error} = await this.supa.db
    .from('task')
    .select('*')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

    if(error) throw this.asForbidden(error);

    return data;
  }

  async getBydId(userId, taskId) {
    const { data, error } = await this.supa.db
      .from('task')
      .select('*')
      .eq('user_id', userId)
      .eq('id', taskId);

    if (error) throw this.asForbidden(error);
    if (data.length === 0) { };

    return data[0];
  }

  async create(userId: string, dto: CreateTaskInput) {
    const { data, error } = await this.supa.db
      .from('task')
      .insert({
        user_id: userId,
        title: dto.title,
        description: dto.description ?? null,
      })
      .select('*')
      .single();

    if (error) throw this.asForbidden(error);
    return data;
  }

  async completeTask(userId: string, taskId: string) {
    try {
      const { data, error } = await this.supa.db
        .from('task')
        .update({
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'done'
        })
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao completar tarefa:', error);
        throw new Error(`Falha ao completar tarefa: ${error.message}`);
      }

      return { data, error: null };

    } catch (error) {
      console.error('Erro inesperado ao completar tarefa:', error);
      return { data: null, error };
    }
  }

  async update(taskId: string, userId: string, dto: UpdateTaskDto) {
    const statusMap = {
      'pending': 'new',
      'in_progress': 'in_progress',
      'completed': 'done',
      'archived': 'done',
      'new': 'new'
    };

    const updateData: any = {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      updated_at: new Date().toISOString()
    };

    if (dto.due_date !== undefined) updateData.due_date = dto.due_date;
    if (dto.source_url !== undefined) updateData.source_url = dto.source_url;

    const { data, error } = await this.supa.db
      .from('task')
      .update(updateData)
      .eq('id', taskId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw this.asForbidden(error);
    return data;
  }

  async delete(userId: string, taskId: string) {
    const { data, error } = await this.supa.db
      .from('task')
      .delete()
      .eq('user_id', userId)
      .eq('id', taskId)

    if (error) throw this.asForbidden(error);
    return data;
  }

  private asForbidden(error: any) {
    const msg = [error?.message, error?.details, error?.hint]
      .filter(Boolean)
      .join(' | ');
    return new ForbiddenException(msg || 'Operation not allowed');
  }
}

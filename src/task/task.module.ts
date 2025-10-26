import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { TasksController } from './task.controller';
import { TasksService } from './task.service';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [TasksController],
  providers: [TasksService],
})

export class TasksModule {}

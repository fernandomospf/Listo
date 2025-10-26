import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './task/task.module';

@Module({
  imports: [ ConfigModule.forRoot({ isGlobal: true }), AuthModule, SupabaseModule, TasksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

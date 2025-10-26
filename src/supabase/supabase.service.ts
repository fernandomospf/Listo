import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ scope: Scope.REQUEST })
export class SupabaseService {
  public readonly db: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(@Inject(REQUEST) private readonly req: any) {
    const url = process.env.SUPABASE_URL;
    const anon = process.env.SUPABASE_ANON_KEY;

    if (!url || !anon) {
      this.logger.error('Variáveis de ambiente do Supabase não configuradas');
      throw new Error('Configuração do Supabase incompleta');
    }

    const authHeader = this.req?.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    this.db = createClient(url, anon, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: { 
        headers: token ? { Authorization: `Bearer ${token}` } : {} 
      },
    });

    this.logger.debug('Cliente Supabase inicializado');
  }
}
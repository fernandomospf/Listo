import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  public readonly db: SupabaseClient;

  constructor(@Inject(REQUEST) req: any) {
    const url = process.env.SUPABASE_URL!;
    const anon = process.env.SUPABASE_ANON_KEY!;
    const authHeader = req?.headers?.authorization as string | undefined;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    this.db = createClient(url, anon, {
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    });
  }
}

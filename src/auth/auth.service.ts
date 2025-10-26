import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseAdminService } from '../supabase/supabase-admin.service';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from '../supabase/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly admin: SupabaseAdminService,   
    private readonly supa: SupabaseService,        
  ) {}

  async register(dto: RegisterDto) {
    const { data: existing, error: qErr } = await this.admin.admin
      .from('user_profile')
      .select('id')
      .eq('username', dto.username)
      .maybeSingle();

    if (qErr) throw new InternalServerErrorException(qErr.message);
    if (existing) throw new ConflictException('username já está em uso');

    const { data: created, error: aErr } = await this.admin.admin.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,                
      user_metadata: { name: dto.name, username: dto.username },
    });
    if (aErr || !created?.user) throw new InternalServerErrorException(aErr?.message ?? 'falha ao criar usuário');

    const userId = created.user.id;

    const { error: pErr } = await this.admin.admin.from('user_profile').insert({
      id: userId,
      username: dto.username,
      name: dto.name,
    });
    if (pErr) throw new InternalServerErrorException(pErr.message);

    return {
      id: userId,
      email: created.user.email,
      username: dto.username,
      name: dto.name,
      created_at: created.user.created_at,
    };
  }
}

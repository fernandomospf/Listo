import { ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseAdminService } from '../supabase/supabase-admin.service';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from '../supabase/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly admin: SupabaseAdminService,   
    private readonly supa: SupabaseService,        
  ) {}

  async register(dto: RegisterDto) {
    try {
      const { data: existing, error: qErr } = await this.admin.admin
        .from('user_profile')
        .select('id')
        .eq('username', dto.username)
        .maybeSingle();

      if (qErr) {
        this.logger.error(`Erro ao verificar username: ${qErr.message}`);
        throw new InternalServerErrorException('Erro interno do servidor');
      }
      
      if (existing) {
        throw new ConflictException('Username já está em uso');
      }

     
      const { data: existingEmail } = await this.admin.admin
        .from('user_profile')
        .select('id')
        .eq('email', dto.email)
        .maybeSingle();

      if (existingEmail) {
        throw new ConflictException('Email já está em uso');
      }


      const { data: created, error: aErr } = await this.admin.admin.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: true,
        user_metadata: { 
          name: dto.name, 
          username: dto.username 
        },
      });

      if (aErr || !created?.user) {
        this.logger.error(`Erro ao criar usuário: ${aErr?.message}`);
        throw new InternalServerErrorException('Falha ao criar usuário');
      }

      const userId = created.user.id;

   
      const { error: pErr } = await this.admin.admin
        .from('user_profile')
        .insert({
          id: userId,
          username: dto.username,
          name: dto.name,
          email: dto.email,
        });

      if (pErr) {
        await this.admin.admin.auth.admin.deleteUser(userId);
        this.logger.error(`Erro ao criar perfil: ${pErr.message}`);
        throw new InternalServerErrorException('Falha ao criar perfil do usuário');
      }

      this.logger.log(`Usuário criado com sucesso: ${dto.email}`);

      return {
        id: userId,
        email: created.user.email,
        username: dto.username,
        name: dto.name,
        created_at: created.user.created_at,
      };

    } catch (error) {
      if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(`Erro desconhecido no registro: ${error.message}`);
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }
}
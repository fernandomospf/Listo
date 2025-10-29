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
      this.logger.log(`Iniciando registro para: ${dto.email}`);

      const { data: allUsers, error: allError } = await this.admin.admin
        .from('user')
        .select('id, email, name')
        .order('created_at', { ascending: false });

      if (!allError && allUsers) {
        this.logger.log(`Total de usuários na tabela: ${allUsers.length}`);
        allUsers.forEach(user => {
          this.logger.log(`Usuário: ${user.id} - ${user.email} - ${user.name}`);
        });
      }

      const { data: existingUser } = await this.admin.admin
        .from('user')
        .select('id, email, name')
        .eq('email', dto.email)
        .maybeSingle();

      if (existingUser) {
        this.logger.log(`CONFLITO: Email encontrado - ${existingUser.email} (ID: ${existingUser.id})`);
        throw new ConflictException('Email já está em uso');
      }

      this.logger.log(`Email ${dto.email} disponível, criando usuário...`);

      const { data: createdUser, error: createError } = await this.admin.admin.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: true,
        user_metadata: { 
          name: dto.name, 
        },
      });

      if (createError || !createdUser?.user) {
        throw new InternalServerErrorException('Falha ao criar usuário no sistema');
      }

      const authUserId = createdUser.user.id;

      const { data: insertedUser, error: insertUserError } = await this.admin.admin
        .from('user')
        .insert({
          name: dto.name,
          email: dto.email,
          created_at: new Date().toISOString(),
        })
        .select('id, email')
        .single();

      if (insertUserError) {
        this.logger.error(`Erro na inserção: ${insertUserError.message}`);
        
        if (insertUserError.code === '23505') {
          this.logger.log(`Tentando UPDATE do registro existente...`);
          
          const { data: updatedUser, error: updateError } = await this.admin.admin
            .from('user')
            .update({
              name: dto.name,
              created_at: new Date().toISOString(),
            })
            .eq('email', dto.email)
            .select('id, email')
            .single();

          if (updateError) {
            this.logger.error(`Erro no UPDATE: ${updateError.message}`);
            await this.admin.admin.auth.admin.deleteUser(authUserId);
            throw new ConflictException('Email já está cadastrado no sistema');
          }

          this.logger.log(`Registro atualizado: ${updatedUser.id}`);
          return {
            id: updatedUser.id,
            email: dto.email,
            name: dto.name,
            message: 'Usuário atualizado com sucesso'
          };
        }
        
        await this.admin.admin.auth.admin.deleteUser(authUserId);
        throw new InternalServerErrorException('Falha ao criar registro do usuário');
      }

      this.logger.log(`Novo usuário criado: ${insertedUser.id}`);

      return {
        id: insertedUser.id,
        email: dto.email,
        name: dto.name,
        message: 'Usuário criado com sucesso'
      };

    } catch (error) {
      if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(`Erro no registro: ${error.message}`);
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }
}
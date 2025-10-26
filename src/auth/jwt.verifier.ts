import { Injectable, Logger } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

@Injectable()
export class JwtVerifier {
  private readonly logger = new Logger(JwtVerifier.name);
  private readonly issuer = process.env.JWT_ISSUER!;
  private readonly audience = process.env.JWT_AUDIENCE ?? 'authenticated';
  private readonly jwks = createRemoteJWKSet(new URL(process.env.SUPABASE_JWKS_URL!));
  private readonly secret = process.env.SUPABASE_JWT_SECRET
    ? new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET)
    : undefined;

  async verify(token: string): Promise<JWTPayload> {
    if (!token) {
      throw new Error('Token não fornecido');
    }

    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: this.audience,
      });
      
      this.logger.debug(`JWT verificado para usuário: ${payload.sub}`);
      return payload;

    } catch (jwksError) {
      this.logger.warn(`Falha na verificação JWKS: ${jwksError.message}`);
      
      if (!this.secret) {
        this.logger.error('SUPABASE_JWT_SECRET não configurado');
        throw new Error('Configuração JWT incompleta');
      }

      try {
        const { payload } = await jwtVerify(token, this.secret, {
          issuer: this.issuer,
          audience: this.audience,
        });
        
        this.logger.debug(`JWT verificado com secret local: ${payload.sub}`);
        return payload;

      } catch (secretError) {
        this.logger.error(`Falha na verificação com secret: ${secretError.message}`);
        throw new Error('Token inválido');
      }
    }
  }
}
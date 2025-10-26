import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtVerifier } from './jwt.verifier';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly verifier: JwtVerifier) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      this.logger.warn('Header Authorization não encontrado');
      throw new UnauthorizedException('Header Authorization não encontrado');
    }

    if (!authHeader.startsWith('Bearer ')) {
      this.logger.warn('Formato do Authorization header inválido');
      throw new UnauthorizedException('Formato do Authorization header inválido');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      this.logger.warn('Token não encontrado no header');
      throw new UnauthorizedException('Token não encontrado');
    }

    try {
      const payload = await this.verifier.verify(token);
      req.user = payload;
      
      req.user_id = payload.sub;
      
      this.logger.debug(`Autenticação bem-sucedida para usuário: ${payload.sub}`);
      return true;

    } catch (error) {
      this.logger.error(`Falha na verificação JWT: ${error.message}`);
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtVerifier } from './jwt.verifier';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly verifier: JwtVerifier) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer '))
      throw new UnauthorizedException('Missing or invalid Authorization header');

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.verifier.verify(token);
      req.user = payload;
      return true;
    } catch (err) {
      console.error('JWT verification failed:', err.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}

import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';

export const User = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const logger = new Logger('UserDecorator');
  const req = ctx.switchToHttp().getRequest();
  
  if (!req.user) {
    logger.warn('Tentativa de acessar user em requisição não autenticada');
    throw new Error('User não disponível - rota não autenticada');
  }

  if (data && req.user[data]) {
    return req.user[data];
  }

  return req.user;
});
import { Module } from '@nestjs/common';
import { JwtVerifier } from './jwt.verifier';
import { JwtAuthGuard } from './jwt.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [
    AuthService,
    JwtVerifier, 
    JwtAuthGuard
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, JwtVerifier],
})
export class AuthModule {}
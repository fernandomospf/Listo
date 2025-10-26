import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';
import { User } from './user.decorator';
import { RegisterDto } from 'src/supabase/register.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  
  constructor(
    private readonly authService: AuthService
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@User() user: any) {
    const { sub, email, role, aud } = user ?? {};
    return { id: sub, email, role, aud };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
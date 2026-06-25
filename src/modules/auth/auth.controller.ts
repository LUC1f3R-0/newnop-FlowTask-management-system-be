import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';
import { AuthService } from './auth.service.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

@Controller('auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ResponseMessage('User registered successfully')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ResponseMessage('Login successful')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}

export { AuthController };

import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';

@Controller('auth')
class AuthController {
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return {
      success: true,
      message: 'Register DTO validation passed',
      data: {
        fullName: dto.fullName,
        email: dto.email,
      },
      meta: null,
      errors: null,
    };
  }
}

export { AuthController };

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { GetUser, RequestUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthService } from './auth.service';
import { RegisterCajeroDto } from './dto/register-cajero.dto';

@Controller('auth')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  me(@GetUser() user: RequestUser) {
    return user;
  }

  @Post('register-cajero')
  @Roles(Role.ADMIN)
  registerCajero(@Body() dto: RegisterCajeroDto) {
    return this.authService.registerCajero(dto);
  }

  @Get('users')
  @Roles(Role.ADMIN)
  getUsers() {
    return this.authService.findAll();
  }
}

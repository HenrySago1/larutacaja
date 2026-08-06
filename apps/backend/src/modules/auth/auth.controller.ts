import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
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

  @Put('users/:id')
  @Roles(Role.ADMIN)
  updateUser(@Param('id') id: string, @Body() dto: { name?: string; email?: string; password?: string }) {
    return this.authService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @Roles(Role.ADMIN)
  deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { GetUser, RequestUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CajaService } from './caja.service';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';

@Controller('caja')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Get('activo')
  getActivo() {
    return this.cajaService.getActivo();
  }

  @Get('ultimo-cierre')
  getUltimoCierre() {
    return this.cajaService.getUltimoCierre();
  }

  @Get('historial')
  @Roles(Role.ADMIN)
  getHistorial() {
    return this.cajaService.getHistorial();
  }

  @Post('abrir')
  abrir(@Body() dto: AbrirCajaDto, @GetUser() user: RequestUser) {
    return this.cajaService.abrir(dto, user);
  }

  @Post('cerrar')
  cerrar(@Body() dto: CerrarCajaDto, @GetUser() user: RequestUser) {
    return this.cajaService.cerrar(dto, user);
  }
}

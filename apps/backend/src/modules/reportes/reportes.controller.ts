import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ReportesService } from './reportes.service';

@Controller('reportes')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('resumen-dia')
  resumenDia(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.reportesService.resumenDia(desde, hasta);
  }

  @Get('cajas/:id')
  detalleCaja(@Param('id') id: string) {
    return this.reportesService.detalleCaja(id);
  }
}


import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GetUser, RequestUser } from '../../common/decorators/get-user.decorator';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateEgresoDto } from './dto/create-egreso.dto';
import { EgresosService } from './egresos.service';

@Controller('egresos')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class EgresosController {
  constructor(private readonly egresosService: EgresosService) {}

  @Get()
  findByCajaActiva() {
    return this.egresosService.findByCajaActiva();
  }

  @Post()
  create(@Body() dto: CreateEgresoDto, @GetUser() user: RequestUser) {
    return this.egresosService.create(dto, user);
  }
}

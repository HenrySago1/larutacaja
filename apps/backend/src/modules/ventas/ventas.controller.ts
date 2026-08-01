import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GetUser, RequestUser } from '../../common/decorators/get-user.decorator';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateVentaDto } from './dto/create-venta.dto';
import { VentasService } from './ventas.service';

@Controller('ventas')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Get()
  findByCajaActiva() {
    return this.ventasService.findByCajaActiva();
  }

  @Post()
  create(@Body() dto: CreateVentaDto, @GetUser() user: RequestUser) {
    return this.ventasService.create(dto, user);
  }
}

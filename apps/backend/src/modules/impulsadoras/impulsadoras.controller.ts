import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateImpulsadoraDto } from './dto/create-impulsadora.dto';
import { UpdateImpulsadoraDto } from './dto/update-impulsadora.dto';
import { ImpulsadorasService } from './impulsadoras.service';

@Controller('impulsadoras')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class ImpulsadorasController {
  constructor(private readonly impulsadorasService: ImpulsadorasService) {}

  @Get()
  findAll() {
    return this.impulsadorasService.findAll();
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateImpulsadoraDto) {
    return this.impulsadorasService.create(dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateImpulsadoraDto) {
    return this.impulsadorasService.update(id, dto);
  }
}

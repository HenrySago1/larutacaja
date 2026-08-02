import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateImpulsadoraDto } from './dto/create-impulsadora.dto';
import { UpdateImpulsadoraDto } from './dto/update-impulsadora.dto';

@Injectable()
export class ImpulsadorasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.impulsadora.findMany({ orderBy: { nombre: 'asc' } });
  }

  create(dto: CreateImpulsadoraDto) {
    return this.prisma.impulsadora.create({ data: dto });
  }

  update(id: string, dto: UpdateImpulsadoraDto) {
    return this.prisma.impulsadora.update({ where: { id }, data: dto });
  }
}

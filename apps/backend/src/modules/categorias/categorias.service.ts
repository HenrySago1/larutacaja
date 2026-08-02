import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
  }

  create(dto: { nombre: string }) {
    return this.prisma.categoria.create({ data: dto });
  }

  update(id: string, dto: { nombre?: string }) {
    return this.prisma.categoria.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.categoria.delete({ where: { id } });
  }
}

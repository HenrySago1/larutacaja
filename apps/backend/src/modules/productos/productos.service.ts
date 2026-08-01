import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

type ProductFilters = {
  categoriaId?: string;
  search?: string;
  bajoStock?: boolean;
};

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: ProductFilters) {
    const where: Prisma.ProductoWhereInput = {
      isActive: true,
      categoriaId: filters.categoriaId || undefined,
      nombre: filters.search ? { contains: filters.search, mode: 'insensitive' } : undefined,
    };

    return this.prisma.producto.findMany({
      where,
      include: { categoria: true },
      orderBy: [{ stock: 'asc' }, { nombre: 'asc' }],
    }).then((productos) => (filters.bajoStock ? productos.filter((producto) => producto.stock <= producto.stockMinimo) : productos));
  }

  create(dto: CreateProductoDto) {
    return this.prisma.producto.create({ data: dto, include: { categoria: true } });
  }

  update(id: string, dto: UpdateProductoDto) {
    return this.prisma.producto.update({ where: { id }, data: dto, include: { categoria: true } });
  }
}

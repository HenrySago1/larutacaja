import { BadRequestException, Injectable } from '@nestjs/common';
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

  async create(dto: CreateProductoDto) {
    const existing = await this.prisma.producto.findFirst({
      where: { nombre: { equals: dto.nombre, mode: 'insensitive' } },
    });
    if (existing) {
      throw new BadRequestException('Ya existe un producto con ese nombre');
    }
    return this.prisma.producto.create({ data: dto, include: { categoria: true } });
  }

  async update(id: string, dto: UpdateProductoDto) {
    if (dto.nombre) {
      const existing = await this.prisma.producto.findFirst({
        where: { nombre: { equals: dto.nombre, mode: 'insensitive' }, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException('Ya existe otro producto con ese nombre');
      }
    }
    return this.prisma.producto.update({ where: { id }, data: dto, include: { categoria: true } });
  }

  async remove(id: string) {
    try {
      await this.prisma.producto.delete({ where: { id } });
      return { message: 'Producto eliminado' };
    } catch (error) {
      throw new BadRequestException('No se puede eliminar el producto porque tiene ventas asociadas');
    }
  }
}

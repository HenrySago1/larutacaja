import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { EstadoCaja, Prisma, TipoPago } from '@prisma/client';
import { RequestUser } from '../../common/decorators/get-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';

@Injectable()
export class VentasService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCajaActiva() {
    const caja = await this.prisma.cajaTurno.findFirst({ where: { estado: EstadoCaja.ABIERTO } });
    if (!caja) {
      return [];
    }

    return this.prisma.venta.findMany({
      where: { cajaTurnoId: caja.id },
      include: {
        impulsadora: true,
        cajero: { select: { id: true, name: true } },
        detalles: { include: { producto: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateVentaDto, user: RequestUser) {
    return this.prisma.$transaction(async (tx) => {
      const caja = await tx.cajaTurno.findFirst({ where: { estado: EstadoCaja.ABIERTO } });
      if (!caja) {
        throw new BadRequestException('No hay caja abierta para registrar ventas');
      }

      if (dto.impulsadoraId) {
        const impulsadora = await tx.impulsadora.findFirst({
          where: { id: dto.impulsadoraId, isActive: true },
        });
        if (!impulsadora) {
          throw new BadRequestException('Impulsadora invalida o inactiva');
        }
      }

      const grouped = new Map<string, number>();
      for (const detalle of dto.detalles) {
        grouped.set(detalle.productoId, (grouped.get(detalle.productoId) ?? 0) + detalle.cantidad);
      }

      const productos = await tx.producto.findMany({
        where: { id: { in: [...grouped.keys()] }, isActive: true },
      });

      if (productos.length !== grouped.size) {
        throw new BadRequestException('Uno o mas productos no existen o estan inactivos');
      }

      const productosById = new Map(productos.map((p) => [p.id, p]));

      // 1. Validar y descontar stock globalmente por producto
      for (const [productoId, cantidad] of grouped.entries()) {
        const producto = productosById.get(productoId)!;
        
        if (producto.stock < cantidad) {
          throw new ConflictException(`No hay stock suficiente de ${producto.nombre}`);
        }

        const decrement = await tx.producto.updateMany({
          where: { id: producto.id, stock: { gte: cantidad }, isActive: true },
          data: { stock: { decrement: cantidad } },
        });

        if (decrement.count !== 1) {
          throw new ConflictException(`El stock de ${producto.nombre} cambio durante la venta`);
        }
      }

      // 2. Construir los detalles de venta respetando los precios personalizados
      let total = new Prisma.Decimal(0);
      const detallesData = [];

      for (const detalle of dto.detalles) {
        const producto = productosById.get(detalle.productoId)!;
        let precioFinal = producto.precioVenta;
        
        if (detalle.precioUnitarioPersonalizado !== undefined) {
          const precioPers = new Prisma.Decimal(detalle.precioUnitarioPersonalizado);
          if (precioPers.lessThan(producto.precioCompra)) {
            throw new BadRequestException(`El precio personalizado de ${producto.nombre} no puede ser menor al precio de compra (${producto.precioCompra})`);
          }
          precioFinal = precioPers;
        }

        const subtotal = precioFinal.mul(detalle.cantidad);
        total = total.plus(subtotal);
        detallesData.push({
          productoId: producto.id,
          cantidad: detalle.cantidad,
          precioUnitario: precioFinal,
          subtotal,
        });
      }

      if (dto.tipoPago === TipoPago.MIXTO) {
        const sum = (dto.montoEfectivo ?? 0) + (dto.montoQr ?? 0) + (dto.montoTransf ?? 0);
        const sumDecimal = new Prisma.Decimal(sum);
        if (!sumDecimal.equals(total)) {
          throw new BadRequestException('La suma de los montos parciales no coincide con el total de la venta');
        }
      }

      const venta = await tx.venta.create({
        data: {
          cajaTurnoId: caja.id,
          userId: user.id,
          impulsadoraId: dto.impulsadoraId || null,
          tipoPago: dto.tipoPago,
          montoEfectivo: dto.tipoPago === TipoPago.MIXTO ? dto.montoEfectivo : null,
          montoQr: dto.tipoPago === TipoPago.MIXTO ? dto.montoQr : null,
          montoTransf: dto.tipoPago === TipoPago.MIXTO ? dto.montoTransf : null,
          total,
          detalles: { create: detallesData },
        },
        include: { detalles: true },
      });

      await tx.cajaTurno.update({
        where: { id: caja.id },
        data: this.getCajaAccumulator(dto, total),
      });

      return { message: 'Venta procesada con exito', id: venta.id, total };
    });
  }

  private getCajaAccumulator(dto: CreateVentaDto, total: Prisma.Decimal): Prisma.CajaTurnoUpdateInput {
    if (dto.tipoPago === TipoPago.MIXTO) {
      return {
        totalVentasEfectivo: { increment: dto.montoEfectivo ?? 0 },
        cajaEsperada: { increment: dto.montoEfectivo ?? 0 },
        totalVentasQr: { increment: dto.montoQr ?? 0 },
        totalVentasTransf: { increment: dto.montoTransf ?? 0 },
      };
    }

    if (dto.tipoPago === TipoPago.EFECTIVO) {
      return {
        totalVentasEfectivo: { increment: total },
        cajaEsperada: { increment: total },
      };
    }

    if (dto.tipoPago === TipoPago.QR) {
      return { totalVentasQr: { increment: total } };
    }

    return { totalVentasTransf: { increment: total } };
  }
}

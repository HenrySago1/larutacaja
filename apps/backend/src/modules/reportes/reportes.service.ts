import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async resumenDia(desde?: string, hasta?: string) {
    let start: Date;
    let end: Date;

    if (desde) {
      start = new Date(desde);
      start.setHours(0, 0, 0, 0);
    } else {
      start = new Date();
      start.setHours(0, 0, 0, 0);
    }

    if (hasta) {
      end = new Date(hasta);
      end.setHours(23, 59, 59, 999);
    } else {
      end = new Date(start);
      end.setDate(end.getDate() + 1);
    }

    const [ventas, egresos, bajoStock, cajas] = await Promise.all([
      this.prisma.venta.findMany({
        where: { createdAt: { gte: start, lt: end } },
        include: {
          impulsadora: true,
          cajero: { select: { id: true, name: true } },
          detalles: { include: { producto: true } },
        },
      }),
      this.prisma.egreso.findMany({ where: { createdAt: { gte: start, lt: end } } }),
      this.prisma.producto.findMany({
        where: { isActive: true },
        include: { categoria: true },
        orderBy: { stock: 'asc' },
      }),
      this.prisma.cajaTurno.findMany({ where: { fechaApertura: { gte: start, lt: end } } }),
    ]);

    return { ventas, egresos, bajoStock: bajoStock.filter((producto) => producto.stock <= producto.stockMinimo), cajas };
  }

  async detalleCaja(id: string) {
    const caja = await this.prisma.cajaTurno.findUnique({
      where: { id },
      include: {
        userApertura: { select: { id: true, name: true, email: true } },
        userCierre: { select: { id: true, name: true, email: true } },
        egresosAsociados: true,
        ventasAsociadas: {
          include: {
            impulsadora: true,
            cajero: { select: { id: true, name: true } },
            detalles: { include: { producto: true } },
          },
        },
      },
    });

    if (!caja) {
      throw new NotFoundException('Caja no encontrada');
    }

    return caja;
  }
}


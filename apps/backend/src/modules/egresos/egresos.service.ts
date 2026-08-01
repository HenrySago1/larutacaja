import { BadRequestException, Injectable } from '@nestjs/common';
import { EstadoCaja, Prisma } from '@prisma/client';
import { RequestUser } from '../../common/decorators/get-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEgresoDto } from './dto/create-egreso.dto';

@Injectable()
export class EgresosService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCajaActiva() {
    const caja = await this.prisma.cajaTurno.findFirst({ where: { estado: EstadoCaja.ABIERTO } });
    if (!caja) {
      return [];
    }

    return this.prisma.egreso.findMany({
      where: { cajaTurnoId: caja.id },
      include: { cajero: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateEgresoDto, user: RequestUser) {
    return this.prisma.$transaction(async (tx) => {
      const caja = await tx.cajaTurno.findFirst({ where: { estado: EstadoCaja.ABIERTO } });
      if (!caja) {
        throw new BadRequestException('No hay caja abierta para registrar egresos');
      }

      const monto = new Prisma.Decimal(dto.monto);
      const egreso = await tx.egreso.create({
        data: {
          concepto: dto.concepto,
          detalle: dto.detalle,
          monto,
          cajaTurnoId: caja.id,
          userId: user.id,
        },
      });

      await tx.cajaTurno.update({
        where: { id: caja.id },
        data: {
          totalEgresos: { increment: monto },
          cajaEsperada: { decrement: monto },
        },
      });

      return egreso;
    });
  }
}

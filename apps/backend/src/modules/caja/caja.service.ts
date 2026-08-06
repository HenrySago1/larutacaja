import { BadRequestException, Injectable } from '@nestjs/common';
import { EstadoCaja, Prisma } from '@prisma/client';
import { RequestUser } from '../../common/decorators/get-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';

@Injectable()
export class CajaService {
  constructor(private readonly prisma: PrismaService) {}

  getActivo() {
    return this.prisma.cajaTurno.findFirst({
      where: { estado: EstadoCaja.ABIERTO },
      include: { userApertura: { select: { id: true, name: true, email: true } } },
    });
  }

  getUltimoCierre() {
    return this.prisma.cajaTurno.findFirst({
      where: { estado: EstadoCaja.CERRADO },
      orderBy: { fechaCierre: 'desc' },
      include: {
        userApertura: { select: { id: true, name: true, email: true } },
        userCierre: { select: { id: true, name: true, email: true } },
      },
    });
  }

  getHistorial() {
    return this.prisma.cajaTurno.findMany({
      orderBy: { fechaApertura: 'desc' },
      include: {
        userApertura: { select: { id: true, name: true } },
        userCierre: { select: { id: true, name: true } },
      },
    });
  }

  async abrir(dto: AbrirCajaDto, user: RequestUser) {
    return this.prisma.$transaction(async (tx) => {
      const activa = await tx.cajaTurno.findFirst({ where: { estado: EstadoCaja.ABIERTO } });
      if (activa) {
        throw new BadRequestException('Ya existe una caja abierta');
      }

      const totalInicial = new Prisma.Decimal(dto.totalBilletesInicial).plus(dto.totalMonedasInicial);

      return tx.cajaTurno.create({
        data: {
          totalBilletesInicial: dto.totalBilletesInicial,
          totalMonedasInicial: dto.totalMonedasInicial,
          totalInicial,
          cajaEsperada: totalInicial,
          entregadoPor: dto.entregadoPor,
          recibidoPor: dto.recibidoPor,
          userId: user.id,
        },
      });
    });
  }

  async cerrar(dto: CerrarCajaDto & { entregadoA?: string }, user: RequestUser) {
    return this.prisma.$transaction(async (tx) => {
      const caja = await tx.cajaTurno.findFirst({ where: { estado: EstadoCaja.ABIERTO } });
      if (!caja) {
        throw new BadRequestException('No hay una caja abierta para cerrar');
      }

      const cajaReal = new Prisma.Decimal(dto.cajaReal);
      const diferencia = cajaReal.minus(caja.cajaEsperada);

      const notasCombinadas = [
        dto.entregadoA ? `Entregado turno a: ${dto.entregadoA}` : null,
        dto.notas?.trim() || null,
      ]
        .filter(Boolean)
        .join(' | ');

      if (!diferencia.equals(0) && !dto.notas?.trim()) {
        throw new BadRequestException('Las notas son obligatorias cuando existe diferencia de caja');
      }

      return tx.cajaTurno.update({
        where: { id: caja.id },
        data: {
          cajaReal,
          diferencia,
          notas: notasCombinadas || null,
          fechaCierre: new Date(),
          estado: EstadoCaja.CERRADO,
          cerradoPorId: user.id,
        },
      });
    });
  }
}

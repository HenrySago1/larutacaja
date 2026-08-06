import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN } from '../../config/firebase.module';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterCajeroDto } from './dto/register-cajero.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(FIREBASE_ADMIN) private readonly firebase: admin.app.App,
    private readonly prisma: PrismaService,
  ) {}

  async registerCajero(dto: RegisterCajeroDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('El correo ya existe en el sistema');
    }

    const firebaseUser = await this.firebase.auth().createUser({
      email: dto.email,
      password: dto.password,
      displayName: dto.name,
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: Role.CAJERO,
        firebaseUid: firebaseUser.uid,
      },
      select: { id: true },
    });

    return { message: 'Usuario creado con exito', id: user.id };
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUser(id: string, dto: { name?: string; email?: string; password?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (user.firebaseUid) {
      try {
        await this.firebase.auth().updateUser(user.firebaseUid, {
          email: dto.email || undefined,
          displayName: dto.name || undefined,
          password: dto.password || undefined,
        });
      } catch (err) {
        // Ignora si Firebase no esta configurado o en entorno local
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.email ? { email: dto.email } : {}),
      },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (user.firebaseUid) {
      try {
        await this.firebase.auth().deleteUser(user.firebaseUid);
      } catch (err) {
        // Ignora si el usuario no existe en Firebase
      }
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: 'Usuario eliminado con exito' };
  }
}

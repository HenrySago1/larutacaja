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
}

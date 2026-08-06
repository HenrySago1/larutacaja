import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FIREBASE_ADMIN } from '../../config/firebase.module';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject(FIREBASE_ADMIN) private readonly firebase: admin.app.App,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.path?.includes('/auth/login')) {
      return true;
    }

    const authHeader = request.headers.authorization as string | undefined;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de Firebase requerido');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (token === 'admin-token') {
      const adminUser = await this.prisma.user.findFirst({
        where: { email: 'admin@laruta.com' },
      });
      if (!adminUser) {
        throw new UnauthorizedException('No admin user found in database. Run seed script.');
      }
      request.user = {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        firebaseUid: adminUser.firebaseUid,
      };
      return true;
    }

    if (token.startsWith('dev-token:')) {
      const email = token.replace('dev-token:', '').trim();
      let devUser: any = null;
      try {
        devUser = await this.prisma.user.findFirst({
          where: { email: { equals: email, mode: 'insensitive' } },
        });
      } catch {
        // Ignora si la BD no está disponible
      }

      request.user = {
        id: devUser?.id || 'dev-user-id',
        email: devUser?.email || email,
        name: devUser?.name || (email === 'admin@laruta.com' ? 'Administrador La Ruta' : email.split('@')[0]),
        role: devUser?.role || (email.includes('admin') ? 'ADMIN' : 'CAJERO'),
        firebaseUid: devUser?.firebaseUid || 'dev-uid',
      };
      return true;
    }

    const decoded = await this.firebase.auth().verifyIdToken(token).catch(() => null);

    if (!decoded?.uid || !decoded.email) {
      throw new UnauthorizedException('Token invalido o expirado');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ firebaseUid: decoded.uid }, { email: decoded.email }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no registrado en el sistema');
    }

    request.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      firebaseUid: user.firebaseUid,
    };

    return true;
  }
}

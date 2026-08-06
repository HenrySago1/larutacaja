import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      console.warn('⚠️ No se pudo conectar a la base de datos PostgreSQL:', (err as any)?.message || err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

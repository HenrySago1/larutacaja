import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CajaModule } from './modules/caja/caja.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { EgresosModule } from './modules/egresos/egresos.module';
import { ImpulsadorasModule } from './modules/impulsadoras/impulsadoras.module';
import { ProductosModule } from './modules/productos/productos.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { UsersModule } from './modules/users/users.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseModule } from './config/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    FirebaseModule,
    AuthModule,
    UsersModule,
    CajaModule,
    EgresosModule,
    VentasModule,
    ProductosModule,
    CategoriasModule,
    ImpulsadorasModule,
    ReportesModule,
  ],
})
export class AppModule {}

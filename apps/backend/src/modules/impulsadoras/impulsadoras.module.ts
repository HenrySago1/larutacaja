import { Module } from '@nestjs/common';
import { ImpulsadorasController } from './impulsadoras.controller';
import { ImpulsadorasService } from './impulsadoras.service';

@Module({
  controllers: [ImpulsadorasController],
  providers: [ImpulsadorasService],
})
export class ImpulsadorasModule {}

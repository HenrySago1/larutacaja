import { ConceptoEgreso } from '@prisma/client';
import { IsEnum, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateEgresoDto {
  @IsEnum(ConceptoEgreso)
  concepto: ConceptoEgreso;

  @IsString()
  @MinLength(3)
  detalle: string;

  @IsNumber()
  @Min(0.01)
  monto: number;
}

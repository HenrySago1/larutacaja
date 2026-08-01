import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class AbrirCajaDto {
  @IsNumber()
  @Min(0)
  totalBilletesInicial: number;

  @IsNumber()
  @Min(0)
  totalMonedasInicial: number;

  @IsString()
  @MinLength(2)
  entregadoPor: string;

  @IsString()
  @MinLength(2)
  recibidoPor: string;
}

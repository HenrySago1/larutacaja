import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CerrarCajaDto {
  @IsNumber()
  @Min(0)
  cajaReal: number;

  @IsOptional()
  @IsString()
  entregadoA?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

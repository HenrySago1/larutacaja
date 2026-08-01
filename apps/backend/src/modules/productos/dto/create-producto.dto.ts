import { IsBoolean, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  categoriaId: string;

  @IsNumber()
  @Min(0)
  precioVenta: number;

  @IsNumber()
  @Min(0)
  precioCompra: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  stockMinimo: number;

  @IsOptional()
  @IsString()
  imgUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

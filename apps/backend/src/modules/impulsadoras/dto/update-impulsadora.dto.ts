import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateImpulsadoraDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

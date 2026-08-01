import { IsString, MinLength } from 'class-validator';

export class CreateImpulsadoraDto {
  @IsString()
  @MinLength(2)
  nombre: string;
}

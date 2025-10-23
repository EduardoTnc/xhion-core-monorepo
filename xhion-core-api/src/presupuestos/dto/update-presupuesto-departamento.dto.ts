import { PartialType } from '@nestjs/swagger';
import { CreatePresupuestoDepartamentoDto } from './create-presupuesto-departamento.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdatePresupuestoDepartamentoDto extends PartialType(
  OmitType(CreatePresupuestoDepartamentoDto, ['departamentoId'] as const),
) {}

import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateContextoDepartamentoDto } from './create-contexto-departamento.dto';

export class UpdateContextoDepartamentoDto extends PartialType(
  OmitType(CreateContextoDepartamentoDto, ['departamentoId'] as const)
) {}

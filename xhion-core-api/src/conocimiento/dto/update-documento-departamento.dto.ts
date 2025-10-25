import { PartialType } from '@nestjs/swagger';
import { CreateDocumentoDepartamentoDto } from './create-documento-departamento.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateDocumentoDepartamentoDto extends PartialType(
  OmitType(CreateDocumentoDepartamentoDto, ['departamentoId'] as const),
) {}

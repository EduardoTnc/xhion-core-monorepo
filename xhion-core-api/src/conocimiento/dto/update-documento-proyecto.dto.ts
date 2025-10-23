import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDocumentoProyectoDto } from './create-documento-proyecto.dto';

export class UpdateDocumentoProyectoDto extends PartialType(
  OmitType(CreateDocumentoProyectoDto, ['proyectoId'] as const)
) {}

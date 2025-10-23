import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePresupuestoProyectoDto } from './create-presupuesto-proyecto.dto';

export class UpdatePresupuestoProyectoDto extends PartialType(
  OmitType(CreatePresupuestoProyectoDto, ['proyectoId'] as const),
) {}

import { PartialType } from '@nestjs/swagger';
import { CreatePresupuestoProyectoDto } from './create-presupuesto-proyecto.dto';

export class UpdatePresupuestoProyectoDto extends PartialType(CreatePresupuestoProyectoDto) {}

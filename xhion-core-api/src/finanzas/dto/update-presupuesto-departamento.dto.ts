import { PartialType } from '@nestjs/swagger';
import { CreatePresupuestoDepartamentoDto } from './create-presupuesto-departamento.dto';

export class UpdatePresupuestoDepartamentoDto extends PartialType(CreatePresupuestoDepartamentoDto) {}

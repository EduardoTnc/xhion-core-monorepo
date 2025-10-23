import { PartialType } from '@nestjs/swagger';
import { CreateContextoOrganizacionalDto } from './create-contexto-organizacional.dto';

export class UpdateContextoOrganizacionalDto extends PartialType(CreateContextoOrganizacionalDto) {}

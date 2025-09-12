import { UUID } from "crypto";

export class CreateInvitacionDto {
  nombre_completo: string;
  email: string;
  rol_id: UUID;
  departamento_id: UUID;
  invitado_por_id: UUID;
}
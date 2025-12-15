import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class AsignarUsuariosDto {
    @ApiProperty({
        description: 'Lista de IDs de usuarios a asignar al departamento',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        type: [String],
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsUUID('4', { each: true })
    usuarioIds: string[];
}

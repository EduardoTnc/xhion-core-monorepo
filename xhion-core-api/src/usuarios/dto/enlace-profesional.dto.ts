import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { TipoEnlaceProfesional } from '@prisma/client';

/**
 * DTO for creating a new professional link for a user.
 */
export class CreateEnlaceProfesionalDto {
    @ApiProperty({
        description: 'Type of professional link',
        enum: TipoEnlaceProfesional,
        example: 'linkedin',
    })
    @IsNotEmpty({ message: 'El tipo de enlace es requerido' })
    @IsEnum(TipoEnlaceProfesional, { message: 'El tipo de enlace debe ser uno de: linkedin, portafolio_personal, blog_tecnico' })
    tipo: TipoEnlaceProfesional;

    @ApiProperty({
        description: 'URL of the professional link',
        example: 'https://linkedin.com/in/juanperez',
    })
    @IsNotEmpty({ message: 'La URL es requerida' })
    @IsString({ message: 'La URL debe ser una cadena de texto' })
    @IsUrl({}, { message: 'La URL debe ser una URL válida' })
    url: string;
}

/**
 * DTO for updating an existing professional link.
 */
export class UpdateEnlaceProfesionalDto {
    @ApiPropertyOptional({
        description: 'Updated URL of the professional link',
        example: 'https://linkedin.com/in/juanperez-updated',
    })
    @IsOptional()
    @IsString({ message: 'La URL debe ser una cadena de texto' })
    @IsUrl({}, { message: 'La URL debe ser una URL válida' })
    url?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsObject } from 'class-validator';

/**
 * DTO para actualizar el perfil profesional del usuario.
 * Estos datos se almacenan como JSON en ConfiguracionUsuario.perfilProfesional
 * 
 * NOTA: La estructura coincide con la del frontend (ProfessionalProfileSection.tsx)
 */
export class UpdatePerfilProfesionalDto {
    @ApiPropertyOptional({
        description: 'Años de experiencia profesional',
        example: '3-5',
        enum: ['0-1', '1-3', '3-5', '5-10', '10+']
    })
    @IsOptional()
    @IsString()
    yearsExperience?: string | null;

    @ApiPropertyOptional({
        description: 'Nivel profesional actual',
        example: 'autonomo',
        enum: ['aprendiz', 'operativo', 'autonomo', 'especialista', 'estrategico']
    })
    @IsOptional()
    @IsString()
    professionalLevel?: string | null;

    @ApiPropertyOptional({
        description: 'Lista de especializaciones',
        example: ['frontend', 'backend', 'mobile'],
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    specializations?: string[];

    @ApiPropertyOptional({
        description: 'Modalidad de trabajo preferida',
        example: 'hybrid',
        enum: ['office', 'remote', 'hybrid']
    })
    @IsOptional()
    @IsString()
    workModality?: string | null;

    @ApiPropertyOptional({
        description: 'Capacidad actual para nuevos proyectos',
        example: 'available',
        enum: ['available', 'partial', 'busy', 'unavailable']
    })
    @IsOptional()
    @IsString()
    currentCapacity?: string | null;

    @ApiPropertyOptional({
        description: 'Horario semanal de disponibilidad',
        example: {
            lunes: { enabled: true, startTime: '09:00', endTime: '18:00' },
            martes: { enabled: true, startTime: '09:00', endTime: '18:00' },
            miercoles: { enabled: true, startTime: '09:00', endTime: '18:00' },
            jueves: { enabled: true, startTime: '09:00', endTime: '18:00' },
            viernes: { enabled: true, startTime: '09:00', endTime: '18:00' },
            sabado: { enabled: false, startTime: '09:00', endTime: '13:00' },
            domingo: { enabled: false, startTime: '09:00', endTime: '13:00' }
        }
    })
    @IsOptional()
    @IsObject()
    weeklySchedule?: Record<string, { enabled: boolean; startTime: string; endTime: string }>;

    @ApiPropertyOptional({
        description: 'Experiencia en liderazgo de equipos',
        example: 'medium',
        enum: ['none', 'small', 'medium', 'large']
    })
    @IsOptional()
    @IsString()
    leadershipExperience?: string | null;

    @ApiPropertyOptional({
        description: 'Idiomas con nivel de competencia',
        example: { es: 'native', en: 'advanced', pt: 'intermediate' }
    })
    @IsOptional()
    @IsObject()
    languages?: Record<string, string>;

    // ========== ACADEMIC/PROFESSIONAL EXTENSION FIELDS ==========

    @ApiPropertyOptional({
        description: 'Título académico obtenido',
        example: 'Ingeniero de Sistemas'
    })
    @IsOptional()
    @IsString()
    tituloAcademico?: string | null;

    @ApiPropertyOptional({
        description: 'Institución educativa donde se obtuvo el título',
        example: 'Universidad Nacional de Ingeniería'
    })
    @IsOptional()
    @IsString()
    institucionEducativa?: string | null;

    @ApiPropertyOptional({
        description: 'Lista de certificaciones profesionales',
        example: ['AWS Solutions Architect', 'Scrum Master', 'PMP'],
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    certificaciones?: string[];
}

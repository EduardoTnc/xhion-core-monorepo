import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateContextoOrganizacionalDto {
  @ApiPropertyOptional({
    description: 'Misión de la organización',
    example: 'Proveer soluciones tecnológicas innovadoras que transformen la productividad empresarial',
  })
  @IsOptional()
  @IsString()
  mision?: string;

  @ApiPropertyOptional({
    description: 'Visión de la organización',
    example: 'Ser líderes en transformación digital para empresas medianas en Latinoamérica',
  })
  @IsOptional()
  @IsString()
  vision?: string;

  @ApiPropertyOptional({
    description: 'Objetivos estratégicos de la organización',
    example: 'Incrementar la eficiencia operativa en un 30%, expandir a 5 nuevos mercados',
  })
  @IsOptional()
  @IsString()
  objetivosEstrategicos?: string;

  @ApiPropertyOptional({
    description: 'Descripción general de la organización',
    example: 'Empresa de tecnología especializada en soluciones de gestión empresarial',
  })
  @IsOptional()
  @IsString()
  descripcionGeneral?: string;

  @ApiPropertyOptional({
    description: 'Industria o sector de la organización',
    example: 'Tecnología y Software',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industria?: string;

  @ApiPropertyOptional({
    description: 'Tamaño de la empresa',
    example: 'Mediana (50-250 empleados)',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tamanoEmpresa?: string;

  @ApiPropertyOptional({
    description: 'Valores empresariales',
    example: 'Innovación, Integridad, Colaboración, Excelencia',
  })
  @IsOptional()
  @IsString()
  valoresEmpresariales?: string;
}

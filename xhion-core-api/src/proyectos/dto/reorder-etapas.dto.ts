import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

class EtapaOrdenDto {
  @ApiProperty({
    description: 'ID de la etapa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Nuevo orden de la etapa',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  orden: number;
}

export class ReorderEtapasDto {
  @ApiProperty({
    description: 'Array de etapas con su nuevo orden',
    type: [EtapaOrdenDto],
    example: [
      { id: '550e8400-e29b-41d4-a716-446655440000', orden: 1 },
      { id: '550e8400-e29b-41d4-a716-446655440001', orden: 2 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos una etapa' })
  @ValidateNested({ each: true })
  @Type(() => EtapaOrdenDto)
  etapas: EtapaOrdenDto[];
}

# 🔧 CORRECCIONES NECESARIAS - SCHEMA PRESUPUESTOS

## PROBLEMAS IDENTIFICADOS:

### 1. PresupuestoProyecto NO tiene fechaInicio/fechaFin
**Schema actual:**
```prisma
model PresupuestoProyecto {
  id                   String             @id @default(uuid()) @db.Uuid
  proyectoId           String             @unique @db.Uuid
  montoTotal           Decimal            @db.Decimal(15, 2)
  montoGastado         Decimal            @default(0) @db.Decimal(15, 2)
  montoDisponible      Decimal            @db.Decimal(15, 2)
  estado               EstadoPresupuesto  @default(Activo)
  descripcion          String?
  fechaCreacion        DateTime           @default(now())
  fechaActualizacion   DateTime           @updatedAt
  creadoPorId          String             @db.Uuid
}
```

**Solución:** Eliminar fechaInicio/fechaFin del DTO de proyecto

### 2. MovimientoPresupuesto usa "comprobante" no "referencia"
**Schema:**
```prisma
comprobante String? // URL o referencia al comprobante
```

**Solución:** Cambiar "referencia" por "comprobante" en DTO

### 3. Enum TipoMovimientoPresupuesto NO tiene "Reembolso"
**Schema:**
```prisma
enum TipoMovimientoPresupuesto {
  Asignacion
  Gasto
  Ajuste
  Transferencia
}
```

**Solución:** Eliminar lógica de Reembolso del Service

## ACCIONES:
1. ✅ Actualizar DTO de presupuesto proyecto (eliminar fechas)
2. ✅ Actualizar DTO de movimiento (cambiar referencia por comprobante)
3. ✅ Actualizar Service (eliminar caso Reembolso)

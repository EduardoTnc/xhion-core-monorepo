# 🔐 PERMISOS PARA MÓDULO DE RECURSOS

Agregar estos permisos al seed de permisos (`permisos.seed.ts`):

```typescript
// MÓDULO: RECURSOS E INVENTARIO
{
  codigo: 'recursos:crear',
  nombre: 'Crear Recursos',
  descripcion: 'Permite crear nuevos recursos en el inventario',
  modulo: 'Recursos'
},
{
  codigo: 'recursos:ver',
  nombre: 'Ver Recursos',
  descripcion: 'Permite ver recursos y reportes de inventario',
  modulo: 'Recursos'
},
{
  codigo: 'recursos:editar',
  nombre: 'Editar Recursos',
  descripcion: 'Permite actualizar información de recursos',
  modulo: 'Recursos'
},
{
  codigo: 'recursos:eliminar',
  nombre: 'Eliminar Recursos',
  descripcion: 'Permite eliminar recursos del inventario',
  modulo: 'Recursos'
},
{
  codigo: 'recursos:asignar',
  nombre: 'Asignar Recursos',
  descripcion: 'Permite asignar recursos a departamentos o proyectos',
  modulo: 'Recursos'
},
{
  codigo: 'recursos:registrar_movimiento',
  nombre: 'Registrar Movimientos',
  descripcion: 'Permite registrar entradas, salidas y movimientos de inventario',
  modulo: 'Recursos'
},
```

**Total:** 6 permisos nuevos para el módulo de Recursos

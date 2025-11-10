#!/usr/bin/env python3
"""
Script para corregir automáticamente todos los errores del seed empresa-completa.seed.ts
"""

import re

def fix_seed_file():
    input_file = 'empresa-completa.seed.ts'
    output_file = 'empresa-completa-fixed.seed.ts'
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("🔧 Aplicando correcciones...")
    
    # 1. Eliminar todos los bloques de contexto
    print("1. Eliminando campos 'contexto'...")
    # Eliminar contexto de departamentos y proyectos
    content = re.sub(r',?\s*contexto:\s*\{[^}]*\},?', '', content, flags=re.DOTALL)
    
    # 2. Corregir snake_case a camelCase
    print("2. Corrigiendo snake_case a camelCase...")
    replacements = {
        'fecha_inicio': 'fechaInicio',
        'fecha_fin': 'fechaFin',
        'fecha_fin_estimada': 'fechaFin',
        'fecha_vencimiento': 'fechaVencimiento',
        'fecha_completada': 'fechaCompletado',
        'creado_por_id': 'responsableId',
        'proyecto_id': 'proyectoId',
        'usuario_id': 'usuarioId',
        'idea_id': 'ideaId',
        'etapa_id': 'etapaId',
        'asignado_a_id': 'asignadoId',
        'asignadoId': 'asignadoId',
        'departamento_id': 'departamentoId',
        'tarea_id': 'tareaId',
        'rol_id': 'rolId',
        'jefe_id': 'jefeId',
        'propuesto_por_id': 'autorId',
        'monto_total': 'montoTotal',
        'monto_gastado': 'montoGastado',
        'monto_disponible': 'montoDisponible',
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    # Eliminar proyecto_padre_id (no existe en schema)
    content = re.sub(r'\s*proyecto_padre_id:.*?,?\n', '', content)
    
    # 3. Corregir enums de EstadoProyecto
    print("3. Corrigiendo enums de EstadoProyecto...")
    content = content.replace('EstadoProyecto.EnProgreso', 'EstadoProyecto.Activo')
    content = content.replace('EstadoProyecto.Planificacion', 'EstadoProyecto.Activo')
    
    # 4. Corregir enums de EstadoTarea
    print("4. Corrigiendo enums de EstadoTarea...")
    content = content.replace('EstadoTarea.Completada', 'EstadoTarea.Hecho')
    content = content.replace('EstadoTarea.Pendiente', 'EstadoTarea.Por_Hacer')
    content = content.replace('EstadoTarea.EnProgreso', 'EstadoTarea.En_Progreso')
    
    # 5. Corregir RolProyecto de strings a enums
    print("5. Corrigiendo RolProyecto...")
    content = content.replace("rol: 'Líder'", "rol: RolProyecto.Responsable")
    content = content.replace("rol: 'Coordinadora'", "rol: RolProyecto.Responsable")
    content = content.replace("rol: 'Líder Técnico'", "rol: RolProyecto.Responsable")
    content = content.replace("rol: 'Miembro'", "rol: RolProyecto.Miembro")
    content = content.replace("rol: 'Colaborador'", "rol: RolProyecto.Miembro")
    
    # 6. Corregir password a passwordHash
    print("6. Corrigiendo 'password' a 'passwordHash'...")
    content = content.replace('password:', 'passwordHash:')
    
    # 7. Corregir modelo presupuesto
    print("7. Corrigiendo modelo 'presupuesto'...")
    content = content.replace('prisma.presupuesto', 'prisma.presupuestoProyecto')
    content = content.replace('prisma.presupuestoProyectoProyecto', 'prisma.presupuestoProyecto')
    
    # 8. Agregar comas faltantes antes de miembros
    print("8. Agregando comas faltantes...")
    content = re.sub(r'(\s+responsableId:\s+\w+\.id)\n(\s+miembros:\s+\{)', r'\1,\n\2', content)
    content = re.sub(r'(\s+responsableId:\s+\w+\.id)\n(\s+miembros:\s+\{)', r'\1,\n\2', content)
    
    # 8. Limpiar comas dobles y espacios extra
    print("8. Limpiando formato...")
    content = re.sub(r',\s*,', ',', content)
    content = re.sub(r',\s*\}', '\n    }', content)
    
    # Guardar archivo corregido
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ Archivo corregido guardado en: {output_file}")
    print("\n📝 Resumen de correcciones:")
    print("   - Campos 'contexto' eliminados")
    print("   - snake_case → camelCase")
    print("   - Enums corregidos")
    print("   - RolProyecto corregido")
    print("   - password → passwordHash")
    print("   - presupuesto → presupuestoProyecto")

if __name__ == '__main__':
    fix_seed_file()

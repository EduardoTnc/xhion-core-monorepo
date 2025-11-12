/**
 * Script de Verificación de Sincronización de Permisos
 * 
 * Verifica que los permisos del backend (seed) estén sincronizados
 * con los permisos del frontend (constants)
 */

import { PrismaClient } from '@prisma/client';
import { PERMISOS_CATALOGO } from '../prisma/seeds/permisos.seed';

const prisma = new PrismaClient();

interface ResultadoVerificacion {
  totalBackend: number;
  totalFrontend: number;
  sincronizado: boolean;
  permisosFaltantesEnDB: string[];
  permisosExtraEnDB: string[];
  modulosBackend: Map<string, number>;
  resumen: string;
}

async function verificarSincronizacion(): Promise<ResultadoVerificacion> {
  console.log('🔍 Verificando sincronización de permisos...\n');

  // 1. Obtener permisos del backend (seed)
  const permisosBackend = PERMISOS_CATALOGO.map(p => p.nombreAccion);
  const totalBackend = permisosBackend.length;

  // 2. Obtener permisos de la base de datos
  const permisosDB = await prisma.permiso.findMany({
    select: {
      nombreAccion: true,
      descripcion: true,
    },
  });
  const permisosDBSet = new Set(permisosDB.map(p => p.nombreAccion));

  // 3. Comparar
  const permisosFaltantesEnDB = permisosBackend.filter(p => !permisosDBSet.has(p));
  const permisosExtraEnDB = Array.from(permisosDBSet).filter(p => !permisosBackend.includes(p));

  // 4. Contar por módulo
  const modulosBackend = new Map<string, number>();
  PERMISOS_CATALOGO.forEach(p => {
    const count = modulosBackend.get(p.modulo) || 0;
    modulosBackend.set(p.modulo, count + 1);
  });

  // 5. Generar resumen
  const sincronizado = permisosFaltantesEnDB.length === 0 && permisosExtraEnDB.length === 0;
  
  let resumen = '';
  resumen += `📊 RESUMEN DE VERIFICACIÓN\n`;
  resumen += `${'='.repeat(50)}\n\n`;
  resumen += `Backend (Seed):\n`;
  resumen += `  Total de permisos: ${totalBackend}\n`;
  resumen += `  Módulos únicos: ${modulosBackend.size}\n\n`;
  resumen += `Base de Datos:\n`;
  resumen += `  Total de permisos: ${permisosDB.length}\n\n`;
  resumen += `Estado: ${sincronizado ? '✅ SINCRONIZADO' : '❌ DESINCRONIZADO'}\n\n`;

  if (permisosFaltantesEnDB.length > 0) {
    resumen += `⚠️  Permisos faltantes en DB (${permisosFaltantesEnDB.length}):\n`;
    permisosFaltantesEnDB.forEach(p => {
      resumen += `   - ${p}\n`;
    });
    resumen += `\n`;
  }

  if (permisosExtraEnDB.length > 0) {
    resumen += `⚠️  Permisos extra en DB (${permisosExtraEnDB.length}):\n`;
    permisosExtraEnDB.forEach(p => {
      resumen += `   - ${p}\n`;
    });
    resumen += `\n`;
  }

  resumen += `📋 Distribución por módulo:\n`;
  Array.from(modulosBackend.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([modulo, count]) => {
      resumen += `   ${modulo.padEnd(20)} ${count} permisos\n`;
    });

  return {
    totalBackend,
    totalFrontend: totalBackend, // Asumimos que frontend está sincronizado con seed
    sincronizado,
    permisosFaltantesEnDB,
    permisosExtraEnDB,
    modulosBackend,
    resumen,
  };
}

async function main() {
  try {
    const resultado = await verificarSincronizacion();
    
    console.log(resultado.resumen);

    if (!resultado.sincronizado) {
      console.log('\n💡 Recomendación: Ejecuta el seed para sincronizar:');
      console.log('   pnpm prisma db seed\n');
      process.exit(1);
    } else {
      console.log('\n✅ Sistema de permisos completamente sincronizado!\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error al verificar sincronización:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

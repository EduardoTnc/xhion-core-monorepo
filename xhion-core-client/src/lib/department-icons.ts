import {
  Building2,
  Code,
  Palette,
  ShoppingCart,
  Sparkles,
  UserCheck,
  Wrench,
  Briefcase,
  DollarSign,
  HeartPulse,
  Shield,
  Truck,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"

export interface DepartmentIconOption {
  name: string
  icon: LucideIcon
  label: string
  color: string
}

export const DEPARTMENT_ICONS: DepartmentIconOption[] = [
  { name: "Building2", icon: Building2, label: "Edificio", color: "text-gray-600" },
  { name: "Code", icon: Code, label: "Desarrollo/Sistemas", color: "text-blue-600" },
  { name: "Palette", icon: Palette, label: "Diseño", color: "text-pink-600" },
  { name: "ShoppingCart", icon: ShoppingCart, label: "Ventas", color: "text-green-600" },
  { name: "Sparkles", icon: Sparkles, label: "Marketing", color: "text-purple-600" },
  { name: "UserCheck", icon: UserCheck, label: "Recursos Humanos", color: "text-orange-600" },
  { name: "Wrench", icon: Wrench, label: "Mantenimiento", color: "text-yellow-600" },
  { name: "Briefcase", icon: Briefcase, label: "Administración", color: "text-slate-600" },
  { name: "DollarSign", icon: DollarSign, label: "Finanzas", color: "text-emerald-600" },
  { name: "HeartPulse", icon: HeartPulse, label: "Salud/Bienestar", color: "text-red-600" },
  { name: "Shield", icon: Shield, label: "Seguridad", color: "text-indigo-600" },
  { name: "Truck", icon: Truck, label: "Logística", color: "text-amber-600" },
  { name: "Users", icon: Users, label: "Equipo/Colaboración", color: "text-cyan-600" },
  { name: "Zap", icon: Zap, label: "Energía/Innovación", color: "text-violet-600" },
]

/**
 * Obtiene el icono y color de un departamento por su nombre de icono
 */
export function getDepartmentIcon(iconName?: string | null): {
  icon: LucideIcon
  color: string
} {
  if (!iconName) {
    return { icon: Building2, color: "text-gray-600" }
  }

  const found = DEPARTMENT_ICONS.find((opt) => opt.name === iconName)
  return found ? { icon: found.icon, color: found.color } : { icon: Building2, color: "text-gray-600" }
}

/**
 * Obtiene el icono de un departamento por su nombre (para compatibilidad con código antiguo)
 */
export function getDepartmentIconByName(nombre: string): {
  icon: LucideIcon
  color: string
} {
  const iconMap: Record<string, { icon: LucideIcon; color: string }> = {
    "Ventas": { icon: ShoppingCart, color: "text-green-600" },
    "Marketing": { icon: Sparkles, color: "text-purple-600" },
    "Diseño": { icon: Palette, color: "text-pink-600" },
    "Diseño Gráfico": { icon: Palette, color: "text-pink-600" },
    "Sistemas": { icon: Code, color: "text-blue-600" },
    "Desarrollo": { icon: Code, color: "text-blue-600" },
    "Recursos Humanos": { icon: UserCheck, color: "text-orange-600" },
    "Mantenimiento": { icon: Wrench, color: "text-yellow-600" },
    "Mantenimiento y Taller": { icon: Wrench, color: "text-yellow-600" },
  }

  return iconMap[nombre] || { icon: Building2, color: "text-gray-600" }
}

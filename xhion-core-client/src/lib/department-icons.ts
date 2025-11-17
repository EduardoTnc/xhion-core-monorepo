import {
  Anchor,
  Award,
  Briefcase,
  Building2,
  ClipboardList,
  Code,
  Cpu,
  DollarSign,
  Factory,
  FlaskConical,
  Globe,
  GraduationCap,
  Handshake,
  HeartPulse,
  Layers,
  LifeBuoy,
  Lightbulb,
  LineChart,
  Microscope,
  Network,
  NotebookPen,
  Palette,
  Scale,
  Server,
  Shield,
  ShoppingCart,
  Sparkles,
  Truck,
  UserCheck,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react"

export interface DepartmentIconOption {
  name: string
  icon: LucideIcon
  label: string
  color: string
}

const DEFAULT_ICON_COLOR = "text-neutral-700 dark:text-neutral-100"

export const DEPARTMENT_ICONS: DepartmentIconOption[] = [
  { name: "Building2", icon: Building2, label: "Operaciones generales", color: DEFAULT_ICON_COLOR },
  { name: "Briefcase", icon: Briefcase, label: "Administración", color: DEFAULT_ICON_COLOR },
  { name: "Code", icon: Code, label: "Tecnología", color: DEFAULT_ICON_COLOR },
  { name: "Cpu", icon: Cpu, label: "Infraestructura TI", color: DEFAULT_ICON_COLOR },
  { name: "Palette", icon: Palette, label: "Diseño", color: DEFAULT_ICON_COLOR },
  { name: "Sparkles", icon: Sparkles, label: "Marketing", color: DEFAULT_ICON_COLOR },
  { name: "ShoppingCart", icon: ShoppingCart, label: "Ventas", color: DEFAULT_ICON_COLOR },
  { name: "DollarSign", icon: DollarSign, label: "Finanzas", color: DEFAULT_ICON_COLOR },
  { name: "LineChart", icon: LineChart, label: "Estrategia", color: DEFAULT_ICON_COLOR },
  { name: "Users", icon: Users, label: "Talento", color: DEFAULT_ICON_COLOR },
  { name: "UserCheck", icon: UserCheck, label: "Recursos Humanos", color: DEFAULT_ICON_COLOR },
  { name: "Handshake", icon: Handshake, label: "Alianzas", color: DEFAULT_ICON_COLOR },
  { name: "Layers", icon: Layers, label: "Producto / PMO", color: DEFAULT_ICON_COLOR },
  { name: "Globe", icon: Globe, label: "Expansión", color: DEFAULT_ICON_COLOR },
  { name: "Truck", icon: Truck, label: "Logística", color: DEFAULT_ICON_COLOR },
  { name: "Factory", icon: Factory, label: "Manufactura", color: DEFAULT_ICON_COLOR },
  { name: "Wrench", icon: Wrench, label: "Mantenimiento", color: DEFAULT_ICON_COLOR },
  { name: "Shield", icon: Shield, label: "Seguridad", color: DEFAULT_ICON_COLOR },
  { name: "LifeBuoy", icon: LifeBuoy, label: "Soporte / CS", color: DEFAULT_ICON_COLOR },
  { name: "Lightbulb", icon: Lightbulb, label: "Innovación", color: DEFAULT_ICON_COLOR },
  { name: "Zap", icon: Zap, label: "Operaciones ágiles", color: DEFAULT_ICON_COLOR },
  { name: "HeartPulse", icon: HeartPulse, label: "Salud / Bienestar", color: DEFAULT_ICON_COLOR },
  { name: "NotebookPen", icon: NotebookPen, label: "Documentación", color: DEFAULT_ICON_COLOR },
  { name: "ClipboardList", icon: ClipboardList, label: "Compliance", color: DEFAULT_ICON_COLOR },
  { name: "Server", icon: Server, label: "Plataforma / Cloud", color: DEFAULT_ICON_COLOR },
  { name: "Network", icon: Network, label: "Comunicaciones", color: DEFAULT_ICON_COLOR },
  { name: "FlaskConical", icon: FlaskConical, label: "I+D", color: DEFAULT_ICON_COLOR },
  { name: "Microscope", icon: Microscope, label: "Laboratorio", color: DEFAULT_ICON_COLOR },
  { name: "GraduationCap", icon: GraduationCap, label: "Academia", color: DEFAULT_ICON_COLOR },
  { name: "Award", icon: Award, label: "Calidad", color: DEFAULT_ICON_COLOR },
  { name: "Scale", icon: Scale, label: "Legal", color: DEFAULT_ICON_COLOR },
  { name: "Anchor", icon: Anchor, label: "Comité directivo", color: DEFAULT_ICON_COLOR },
]

/**
 * Obtiene el icono y color de un departamento por su nombre de icono
 */
export function getDepartmentIcon(iconName?: string | null): {
  icon: LucideIcon
  color: string
} {
  if (!iconName) {
    return { icon: Building2, color: DEFAULT_ICON_COLOR }
  }

  const found = DEPARTMENT_ICONS.find((opt) => opt.name === iconName)
  return found ? { icon: found.icon, color: found.color } : { icon: Building2, color: DEFAULT_ICON_COLOR }
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

  return iconMap[nombre] || { icon: Building2, color: DEFAULT_ICON_COLOR }
}

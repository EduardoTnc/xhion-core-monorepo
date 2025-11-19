# 📅 Guía de Componentes de Selección de Fechas

Componentes profesionales de selección de fechas construidos con shadcn/ui Calendar y react-day-picker.

---

## 📦 Componentes Disponibles

### 1. **DatePicker** - Selección de Fecha Simple

Selector de fecha única con calendario desplegable.

#### **Importación:**
```typescript
import { DatePicker } from "@/components/ui/date-picker"
```

#### **Uso Básico:**
```typescript
const [fecha, setFecha] = useState<Date>()

<DatePicker
  date={fecha}
  onDateChange={setFecha}
  placeholder="Selecciona una fecha"
/>
```

#### **Props:**
- `date?: Date` - Fecha seleccionada
- `onDateChange: (date: Date | undefined) => void` - Callback al cambiar fecha
- `placeholder?: string` - Texto placeholder (default: "Selecciona una fecha")
- `disabled?: boolean` - Deshabilitar componente
- `className?: string` - Clases CSS adicionales
- `disabledDates?: Date[]` - Array de fechas a deshabilitar
- `minDate?: Date` - Fecha mínima permitida
- `maxDate?: Date` - Fecha máxima permitida

#### **Ejemplo con Validación:**
```typescript
<DatePicker
  date={fechaVencimiento}
  onDateChange={setFechaVencimiento}
  placeholder="Fecha de vencimiento"
  minDate={new Date()} // Solo fechas futuras
  disabledDates={[
    new Date(2025, 11, 25), // Navidad
    new Date(2025, 0, 1),   // Año nuevo
  ]}
/>
```

---

### 2. **DateRangePicker** - Selección de Rango de Fechas

Selector de rango con dos calendarios lado a lado.

#### **Importación:**
```typescript
import { DateRangePicker } from "@/components/ui/date-range-picker"
```

#### **Uso Básico:**
```typescript
import { DateRange } from "react-day-picker"

const [rango, setRango] = useState<DateRange>()

<DateRangePicker
  dateRange={rango}
  onDateRangeChange={setRango}
  placeholder="Selecciona un rango"
/>
```

#### **Props:**
- `dateRange?: DateRange` - Rango seleccionado `{ from?: Date, to?: Date }`
- `onDateRangeChange: (range: DateRange | undefined) => void` - Callback
- `placeholder?: string` - Texto placeholder
- `disabled?: boolean` - Deshabilitar componente
- `className?: string` - Clases CSS adicionales
- `numberOfMonths?: 1 | 2` - Número de calendarios (default: 2)
- `minDate?: Date` - Fecha mínima permitida
- `maxDate?: Date` - Fecha máxima permitida

#### **Ejemplo con Proyecto:**
```typescript
<DateRangePicker
  dateRange={{ from: fechaInicio, to: fechaFin }}
  onDateRangeChange={(range) => {
    setFechaInicio(range?.from)
    setFechaFin(range?.to)
  }}
  placeholder="Fechas del proyecto"
  minDate={new Date()}
  numberOfMonths={2}
/>
```

---

### 3. **DateTimePicker** - Selección de Fecha y Hora

Selector combinado de fecha y hora con slots de tiempo personalizables.

#### **Importación:**
```typescript
import { DateTimePicker } from "@/components/ui/date-time-picker"
```

#### **Uso Básico:**
```typescript
const [fechaHora, setFechaHora] = useState<Date>()

<DateTimePicker
  date={fechaHora}
  onDateTimeChange={setFechaHora}
  placeholder="Selecciona fecha y hora"
/>
```

#### **Props:**
- `date?: Date` - Fecha y hora seleccionada
- `onDateTimeChange: (date: Date | undefined) => void` - Callback
- `placeholder?: string` - Texto placeholder
- `disabled?: boolean` - Deshabilitar componente
- `className?: string` - Clases CSS adicionales
- `minDate?: Date` - Fecha mínima permitida
- `maxDate?: Date` - Fecha máxima permitida
- `startHour?: number` - Hora de inicio (default: 9)
- `endHour?: number` - Hora de fin (default: 18)
- `minuteInterval?: 15 | 30 | 60` - Intervalo de minutos (default: 15)

#### **Ejemplo con Horario Personalizado:**
```typescript
<DateTimePicker
  date={fechaMovimiento}
  onDateTimeChange={setFechaMovimiento}
  placeholder="Fecha y hora del movimiento"
  startHour={8}
  endHour={20}
  minuteInterval={30}
/>
```

---

### 4. **ChartDateRangePicker** - Gráfico con Filtro de Fecha

Gráfico de barras con selector de rango de fechas integrado.

#### **Importación:**
```typescript
import { ChartDateRangePicker } from "@/components/charts/chart-date-range-picker"
```

#### **Uso Básico:**
```typescript
const gastosData = [
  { date: "2025-01-01", value: 1500 },
  { date: "2025-01-02", value: 2300 },
  // ...
]

<ChartDateRangePicker
  title="Gastos del Departamento"
  description="Visualiza los gastos en el período seleccionado"
  data={gastosData}
  valueLabel="Gastos"
  valueFormatter={(value) => `$${value.toLocaleString()}`}
/>
```

#### **Props:**
- `title: string` - Título del gráfico
- `description: string` - Descripción
- `data: ChartDataPoint[]` - Datos del gráfico
  - `ChartDataPoint = { date: string, value: number, [key: string]: string | number }`
- `valueLabel: string` - Etiqueta del valor
- `valueKey?: string` - Clave del valor en data (default: "value")
- `valueFormatter?: (value: number) => string` - Formateador de valores
- `className?: string` - Clases CSS adicionales
- `chartColor?: string` - Color del gráfico (default: "hsl(var(--primary))")
- `showYAxis?: boolean` - Mostrar eje Y (default: false)
- `showGrid?: boolean` - Mostrar grid (default: true)

#### **Ejemplo con Formato de Moneda:**
```typescript
import { formatCurrency } from "@/lib/formatCurrency"

<ChartDateRangePicker
  title="Análisis de Presupuesto"
  description="Gastos mensuales del departamento"
  data={movimientosData}
  valueLabel="Monto"
  valueKey="monto"
  valueFormatter={formatCurrency}
  chartColor="hsl(var(--destructive))"
  showYAxis={true}
/>
```

---

## 🎨 Características Comunes

### **Localización en Español**
Todos los componentes usan `date-fns/locale/es` para:
- ✅ Nombres de meses en español
- ✅ Días de la semana en español
- ✅ Formato de fechas español (dd/mm/yyyy)

### **Dark Mode**
- ✅ Soporte completo para modo oscuro
- ✅ Colores adaptativos con variables CSS

### **Responsive**
- ✅ Adaptación automática a móvil/tablet/desktop
- ✅ Calendarios apilados en móvil
- ✅ Touch-friendly

### **Accesibilidad**
- ✅ Navegación por teclado
- ✅ ARIA labels
- ✅ Focus management

---

## 📝 Ejemplos de Integración

### **CreateTaskModal.tsx**

```typescript
import { DatePicker } from "@/components/ui/date-picker"

// ❌ ANTES
<Input
  id="fechaVencimiento"
  type="date"
  {...register("fechaVencimiento")}
/>

// ✅ DESPUÉS
<DatePicker
  date={fechaVencimiento}
  onDateChange={(date) => setValue("fechaVencimiento", date)}
  placeholder="Fecha de vencimiento"
  minDate={new Date()}
/>
```

---

### **CreateProjectModal.tsx**

```typescript
import { DateRangePicker } from "@/components/ui/date-range-picker"

// NUEVO - Agregar fechas del proyecto
<div className="space-y-2">
  <Label>Fechas del Proyecto</Label>
  <DateRangePicker
    dateRange={{ from: fechaInicio, to: fechaFin }}
    onDateRangeChange={(range) => {
      setValue("fechaInicio", range?.from)
      setValue("fechaFin", range?.to)
    }}
    placeholder="Inicio y fin del proyecto"
    minDate={new Date()}
  />
</div>
```

---

### **CreateMovementModal.tsx**

```typescript
import { DateTimePicker } from "@/components/ui/date-time-picker"

// ❌ ANTES
<Input type="date" {...register("fechaMovimiento")} />
<Input type="time" {...register("horaMovimiento")} />

// ✅ DESPUÉS
<DateTimePicker
  date={fechaMovimiento}
  onDateTimeChange={(date) => setValue("fechaMovimiento", date)}
  placeholder="Fecha y hora del movimiento"
  startHour={8}
  endHour={20}
/>
```

---

### **BudgetView.tsx**

```typescript
import { ChartDateRangePicker } from "@/components/charts/chart-date-range-picker"
import { formatCurrency } from "@/lib/formatCurrency"

// NUEVO - Análisis de gastos
<ChartDateRangePicker
  title="Gastos del Departamento"
  description="Visualiza los gastos en el período seleccionado"
  data={gastosData}
  valueLabel="Gastos"
  valueFormatter={formatCurrency}
  showYAxis={true}
/>
```

---

## 🔧 Integración con React Hook Form

### **Ejemplo Completo:**

```typescript
import { useForm } from "react-hook-form"
import { DatePicker } from "@/components/ui/date-picker"

interface FormData {
  titulo: string
  fechaVencimiento?: Date
}

export function MyForm() {
  const { register, handleSubmit, setValue, watch } = useForm<FormData>()
  
  const fechaVencimiento = watch("fechaVencimiento")

  const onSubmit = (data: FormData) => {
    console.log(data)
    // fechaVencimiento será un objeto Date
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DatePicker
        date={fechaVencimiento}
        onDateChange={(date) => setValue("fechaVencimiento", date)}
        placeholder="Fecha de vencimiento"
      />
      <Button type="submit">Guardar</Button>
    </form>
  )
}
```

---

## 🎯 Mejores Prácticas

### **1. Validación de Fechas**
```typescript
<DatePicker
  date={fecha}
  onDateChange={setFecha}
  minDate={new Date()} // Solo fechas futuras
  maxDate={new Date(2025, 11, 31)} // Hasta fin de año
/>
```

### **2. Deshabilitar Días Específicos**
```typescript
const diasFestivos = [
  new Date(2025, 11, 25), // Navidad
  new Date(2025, 0, 1),   // Año nuevo
]

<DatePicker
  date={fecha}
  onDateChange={setFecha}
  disabledDates={diasFestivos}
/>
```

### **3. Formato Personalizado**
```typescript
import { format } from "date-fns"
import { es } from "date-fns/locale"

// En el componente
{fecha && (
  <p>Fecha seleccionada: {format(fecha, "PPP", { locale: es })}</p>
)}
```

### **4. Resetear Fecha**
```typescript
<Button onClick={() => setFecha(undefined)}>
  Limpiar fecha
</Button>
```

---

## 🚀 Próximos Pasos

1. ✅ Componentes base creados
2. 🔄 Actualizar modales existentes
3. 🔄 Crear vistas de análisis de presupuestos
4. 🔄 Testing y validación

---

## 📚 Referencias

- [shadcn/ui Calendar](https://ui.shadcn.com/docs/components/calendar)
- [react-day-picker](https://react-day-picker.js.org/)
- [date-fns](https://date-fns.org/)
- [recharts](https://recharts.org/)

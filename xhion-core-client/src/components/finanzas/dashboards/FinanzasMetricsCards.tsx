import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingDown, TrendingUp, Percent, PiggyBank } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  colorClass: string;
}

function MetricCard({ title, value, description, icon, trend, colorClass }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={colorClass}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface FinanzasMetricsCardsProps {
  totalIngresos: number;
  totalGastos: number;
  utilidadNeta: number;
  roi?: number;
  margenPromedio?: number;
}

export default function FinanzasMetricsCards({
  totalIngresos,
  totalGastos,
  utilidadNeta,
  roi,
  margenPromedio,
}: FinanzasMetricsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <MetricCard
        title="Total Ingresos"
        value={`$${totalIngresos.toLocaleString()}`}
        description="Ingresos acumulados"
        icon={<DollarSign className="h-4 w-4" />}
        trend="up"
        colorClass="text-green-600"
      />

      <MetricCard
        title="Total Gastos"
        value={`$${totalGastos.toLocaleString()}`}
        description="Gastos acumulados"
        icon={<TrendingDown className="h-4 w-4" />}
        trend="down"
        colorClass="text-red-600"
      />

      <MetricCard
        title="Utilidad Neta"
        value={`$${utilidadNeta.toLocaleString()}`}
        description={utilidadNeta >= 0 ? 'Ganancia' : 'Pérdida'}
        icon={<PiggyBank className="h-4 w-4" />}
        trend={utilidadNeta >= 0 ? 'up' : 'down'}
        colorClass={utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'}
      />

      {roi !== undefined && (
        <MetricCard
          title="ROI Promedio"
          value={`${roi.toFixed(1)}%`}
          description="Retorno de inversión"
          icon={<Percent className="h-4 w-4" />}
          trend={roi >= 0 ? 'up' : 'down'}
          colorClass={roi >= 20 ? 'text-green-600' : roi >= 0 ? 'text-yellow-600' : 'text-red-600'}
        />
      )}

      {margenPromedio !== undefined && (
        <MetricCard
          title="Margen Promedio"
          value={`${margenPromedio.toFixed(1)}%`}
          description="Margen de utilidad"
          icon={<TrendingUp className="h-4 w-4" />}
          trend={margenPromedio >= 0 ? 'up' : 'down'}
          colorClass={margenPromedio >= 30 ? 'text-green-600' : margenPromedio >= 0 ? 'text-yellow-600' : 'text-red-600'}
        />
      )}
    </div>
  );
}

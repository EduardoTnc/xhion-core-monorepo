/**
 * Formatea un número como moneda en Soles Peruanos (S/.)
 * @param amount - Monto a formatear
 * @param decimals - Número de decimales (por defecto 2)
 * @returns String formateado como "S/. 1,234.56"
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return `S/. ${amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Formatea un número como moneda compacta (sin decimales para montos grandes)
 * @param amount - Monto a formatear
 * @returns String formateado como "S/. 1,234" o "S/. 1.2K"
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000) {
    return `S/. ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `S/. ${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount, 0);
}

/**
 * Símbolo de moneda usado en la aplicación
 */
export const CURRENCY_SYMBOL = 'S/.';

/**
 * Nombre de la moneda
 */
export const CURRENCY_NAME = 'Soles';

export function formatMoney(amount: number, currency = 'CLP') {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'CLP' ? 0 : 2,
  }).format(amount)
}

export function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('es-CL')
}

/** Primer y último día (YYYY-MM-DD) del mes de la fecha dada. */
export function monthRange(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  const ym = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
  return { from: `${ym}-01`, to: `${ym}-${pad(last)}` }
}

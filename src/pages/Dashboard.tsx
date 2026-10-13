import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useAccounts, useCategories, useTransactions } from '../lib/data'
import { formatDate, formatMoney, monthRange } from '../lib/format'

export default function Dashboard() {
  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const { data: transactions } = useTransactions()

  // Por ahora el resumen considera solo cuentas en CLP; el soporte multimoneda llega en una fase posterior.
  const clpAccounts = useMemo(() => new Set(accounts.filter((a) => a.currency === 'CLP').map((a) => a.id)), [accounts])
  const netWorth = accounts.filter((a) => a.currency === 'CLP').reduce((s, a) => s + Number(a.balance), 0)

  const { from, to } = monthRange()
  const monthTx = transactions.filter((t) => t.date >= from && t.date <= to && clpAccounts.has(t.account_id))
  const income = monthTx.filter((t) => t.type === 'ingreso').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = monthTx.filter((t) => t.type === 'gasto').reduce((s, t) => s + Number(t.amount), 0)

  const byCategory = useMemo(() => {
    const totals = new Map<string, number>()
    for (const t of monthTx) {
      if (t.type !== 'gasto') continue
      const key = t.category_id ?? 'none'
      totals.set(key, (totals.get(key) ?? 0) + Number(t.amount))
    }
    return [...totals.entries()]
      .map(([id, value]) => {
        const c = categories.find((c) => c.id === id)
        return { name: c?.name ?? 'Sin categoría', color: c?.color ?? '#cbd5e1', value }
      })
      .sort((a, b) => b.value - a.value)
  }, [monthTx, categories])

  const monthName = new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Resumen</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Patrimonio (CLP)" value={formatMoney(netWorth)} />
        <Stat label={`Ingresos de ${monthName}`} value={formatMoney(income)} className="text-emerald-600" />
        <Stat label={`Gastos de ${monthName}`} value={formatMoney(expenses)} className="text-red-600" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 font-medium">Gastos por categoría</h2>
          {byCategory.length === 0 ? (
            <p className="text-sm text-slate-500">Sin gastos este mes.</p>
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                      {byCategory.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatMoney(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {byCategory.map((d) => (
                  <li key={d.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="flex-1">{d.name}</span>
                    <span>{formatMoney(d.value)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="card">
          <h2 className="mb-3 font-medium">Últimas transacciones</h2>
          <ul className="space-y-2 text-sm">
            {transactions.slice(0, 8).map((t) => (
              <li key={t.id} className="flex justify-between gap-2">
                <span className="truncate">{formatDate(t.date)} · {t.description || t.type}</span>
                <span className={t.type === 'ingreso' ? 'text-emerald-600' : t.type === 'gasto' ? 'text-red-600' : ''}>
                  {formatMoney(t.amount, accounts.find((a) => a.id === t.account_id)?.currency)}
                </span>
              </li>
            ))}
            {transactions.length === 0 && <li className="text-slate-500">Aún no hay movimientos.</li>}
          </ul>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${className}`}>{value}</p>
    </div>
  )
}

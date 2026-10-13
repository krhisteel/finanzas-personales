import { useMemo, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAccounts, useCategories, useTransactions } from '../lib/data'
import { formatDate, formatMoney } from '../lib/format'
import type { TransactionType } from '../lib/types'

const today = () => new Date().toISOString().slice(0, 10)

export default function Transactions() {
  const { data: accounts, reload: reloadAccounts } = useAccounts()
  const { data: categories } = useCategories()
  const { data: transactions, reload } = useTransactions()

  const [type, setType] = useState<TransactionType>('gasto')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())
  const [accountId, setAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [search, setSearch] = useState('')
  const [filterAccount, setFilterAccount] = useState('')

  const accountById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts])
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  async function add(e: FormEvent) {
    e.preventDefault()
    const account = accountId || accounts[0]?.id
    if (!account) return alert('Primero crea una cuenta.')
    const isTransfer = type === 'transferencia'
    if (isTransfer && (!toAccountId || toAccountId === account)) return alert('Elige una cuenta de destino distinta.')
    const { error } = await supabase.from('transactions').insert({
      type,
      amount: Number(amount),
      date,
      account_id: account,
      to_account_id: isTransfer ? toAccountId : null,
      category_id: isTransfer ? null : categoryId || null,
      description: description || null,
    })
    if (error) return alert(error.message)
    setAmount('')
    setDescription('')
    reload()
    reloadAccounts()
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar esta transacción?')) return
    await supabase.from('transactions').delete().eq('id', id)
    reload()
    reloadAccounts()
  }

  const filtered = transactions.filter(
    (t) =>
      (!filterAccount || t.account_id === filterAccount || t.to_account_id === filterAccount) &&
      (!search || (t.description ?? '').toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Transacciones</h1>

      <form onSubmit={add} className="card grid gap-3 sm:grid-cols-6">
        <div className="flex gap-1 sm:col-span-6">
          {(['gasto', 'ingreso', 'transferencia'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize ${type === t ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <input className="input" type="number" step="any" min="0.01" placeholder="Monto" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        {type === 'transferencia' ? (
          <select className="input" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} required>
            <option value="">→ Cuenta destino</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        ) : (
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Sin categoría</option>
            {categories.filter((c) => c.kind === type).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <input className="input sm:col-span-2" placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="btn sm:col-span-6">Guardar</button>
      </form>

      <div className="flex flex-wrap gap-3">
        <input className="input flex-1" placeholder="Buscar por descripción…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input w-auto" value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}>
          <option value="">Todas las cuentas</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <ul className="card divide-y divide-slate-100 p-0">
        {filtered.map((t) => {
          const account = accountById.get(t.account_id)
          const category = t.category_id ? categoryById.get(t.category_id) : undefined
          const sign = t.type === 'ingreso' ? '+' : t.type === 'gasto' ? '−' : ''
          const color = t.type === 'ingreso' ? 'text-emerald-600' : t.type === 'gasto' ? 'text-red-600' : 'text-slate-600'
          return (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: category?.color ?? '#cbd5e1' }} />
              <div className="min-w-0 flex-1">
                <p className="truncate">{t.description || category?.name || (t.type === 'transferencia' ? 'Transferencia' : 'Sin descripción')}</p>
                <p className="text-xs text-slate-500">
                  {formatDate(t.date)} · {account?.name}
                  {t.to_account_id && ` → ${accountById.get(t.to_account_id)?.name}`}
                  {category && ` · ${category.name}`}
                </p>
              </div>
              <span className={`font-medium ${color}`}>{sign}{formatMoney(t.amount, account?.currency)}</span>
              <button className="text-xs text-slate-400 hover:text-red-600" onClick={() => remove(t.id)}>✕</button>
            </li>
          )
        })}
        {filtered.length === 0 && <li className="px-4 py-6 text-center text-slate-500">No hay transacciones.</li>}
      </ul>
    </div>
  )
}

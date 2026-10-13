import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAccounts } from '../lib/data'
import { formatMoney } from '../lib/format'
import { ACCOUNT_TYPE_LABELS, type AccountType } from '../lib/types'

export default function Accounts() {
  const { data: accounts, reload, error } = useAccounts()
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('corriente')
  const [currency, setCurrency] = useState('CLP')
  const [initial, setInitial] = useState('0')

  async function add(e: FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('accounts').insert({ name, type, currency, initial_balance: Number(initial) })
    if (error) return alert(error.message)
    setName('')
    setInitial('0')
    reload()
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar la cuenta y todas sus transacciones?')) return
    await supabase.from('accounts').delete().eq('id', id)
    reload()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cuentas</h1>
      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={add} className="card grid gap-3 sm:grid-cols-5">
        <input className="input sm:col-span-2" placeholder="Nombre (ej. Banco Estado)" value={name} onChange={(e) => setName(e.target.value)} required />
        <select className="input" value={type} onChange={(e) => setType(e.target.value as AccountType)}>
          {Object.entries(ACCOUNT_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option>CLP</option>
          <option>USD</option>
          <option>EUR</option>
        </select>
        <input className="input" type="number" step="any" placeholder="Saldo inicial" value={initial} onChange={(e) => setInitial(e.target.value)} />
        <button className="btn sm:col-span-5">Agregar cuenta</button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2">
        {accounts.map((a) => (
          <div key={a.id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium">{a.name}</p>
              <p className="text-xs text-slate-500">{ACCOUNT_TYPE_LABELS[a.type]} · {a.currency}</p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${a.balance < 0 ? 'text-red-600' : ''}`}>{formatMoney(a.balance, a.currency)}</p>
              <button className="text-xs text-slate-400 hover:text-red-600" onClick={() => remove(a.id)}>Eliminar</button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && <p className="text-slate-500">Aún no tienes cuentas. Crea la primera arriba.</p>}
      </div>
    </div>
  )
}

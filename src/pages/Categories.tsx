import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useCategories } from '../lib/data'
import type { CategoryKind } from '../lib/types'

export default function Categories() {
  const { data: categories, reload } = useCategories()
  const [name, setName] = useState('')
  const [kind, setKind] = useState<CategoryKind>('gasto')
  const [color, setColor] = useState('#10b981')

  async function add(e: FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('categories').insert({ name, kind, color })
    if (error) return alert(error.message)
    setName('')
    reload()
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar la categoría? Las transacciones quedarán sin categoría.')) return
    await supabase.from('categories').delete().eq('id', id)
    reload()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categorías</h1>

      <form onSubmit={add} className="card flex flex-wrap gap-3">
        <input className="input flex-1" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
        <select className="input w-auto" value={kind} onChange={(e) => setKind(e.target.value as CategoryKind)}>
          <option value="gasto">Gasto</option>
          <option value="ingreso">Ingreso</option>
        </select>
        <input className="h-10 w-12 cursor-pointer rounded border border-slate-300" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <button className="btn">Agregar</button>
      </form>

      {(['ingreso', 'gasto'] as const).map((k) => (
        <section key={k}>
          <h2 className="mb-2 font-medium capitalize">{k === 'ingreso' ? 'Ingresos' : 'Gastos'}</h2>
          <ul className="card divide-y divide-slate-100 p-0">
            {categories.filter((c) => c.kind === k).map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-2">
                <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                <span className="flex-1">{c.name}</span>
                <button className="text-xs text-slate-400 hover:text-red-600" onClick={() => remove(c.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export type AccountType = 'efectivo' | 'corriente' | 'vista' | 'ahorro' | 'credito' | 'inversion'
export type TransactionType = 'ingreso' | 'gasto' | 'transferencia'
export type CategoryKind = 'ingreso' | 'gasto'

export interface Account {
  id: string
  name: string
  type: AccountType
  currency: string
  initial_balance: number
  archived: boolean
  balance: number
}

export interface Category {
  id: string
  parent_id: string | null
  name: string
  kind: CategoryKind
  color: string
  icon: string | null
}

export interface Transaction {
  id: string
  account_id: string
  to_account_id: string | null
  category_id: string | null
  type: TransactionType
  amount: number
  date: string
  description: string | null
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  efectivo: 'Efectivo',
  corriente: 'Cuenta corriente',
  vista: 'Cuenta vista / RUT',
  ahorro: 'Ahorro',
  credito: 'Tarjeta de crédito',
  inversion: 'Inversión',
}

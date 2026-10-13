import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Account, Category, Transaction } from './types'

function useQuery<T>(fetcher: () => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    const res = await fetcher()
    setData(res.data ?? [])
    setError(res.error?.message ?? null)
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload }
}

export const useAccounts = () =>
  useQuery<Account>(() => supabase.from('account_balances').select('*').order('created_at'))

export const useCategories = () =>
  useQuery<Category>(() => supabase.from('categories').select('*').order('kind').order('name'))

export const useTransactions = () =>
  useQuery<Transaction>(() =>
    supabase.from('transactions').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
  )

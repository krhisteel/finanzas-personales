-- Esquema inicial (Fase 1): cuentas, categorías y transacciones.
-- Cada fila pertenece a un usuario y está protegida con Row Level Security.

create type account_type as enum ('efectivo', 'corriente', 'vista', 'ahorro', 'credito', 'inversion');
create type transaction_type as enum ('ingreso', 'gasto', 'transferencia');
create type category_kind as enum ('ingreso', 'gasto');

create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  type account_type not null default 'corriente',
  currency text not null default 'CLP',
  initial_balance numeric(14, 2) not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  parent_id uuid references categories on delete cascade,
  name text not null,
  kind category_kind not null,
  color text not null default '#10b981',
  icon text,
  created_at timestamptz not null default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  account_id uuid not null references accounts on delete cascade,
  -- Solo para transferencias: cuenta de destino.
  to_account_id uuid references accounts on delete cascade,
  category_id uuid references categories on delete set null,
  type transaction_type not null,
  amount numeric(14, 2) not null check (amount > 0),
  date date not null default current_date,
  description text,
  created_at timestamptz not null default now(),
  check ((type = 'transferencia') = (to_account_id is not null))
);

create index on transactions (user_id, date desc);
create index on transactions (account_id);

alter table accounts enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;

create policy "own accounts" on accounts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own categories" on categories for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own transactions" on transactions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Saldo actual de cada cuenta = saldo inicial + ingresos - gastos ± transferencias.
create view account_balances with (security_invoker = true) as
select
  a.*,
  a.initial_balance
    + coalesce(sum(case
        when t.type = 'ingreso' and t.account_id = a.id then t.amount
        when t.type = 'gasto' and t.account_id = a.id then -t.amount
        when t.type = 'transferencia' and t.account_id = a.id then -t.amount
        when t.type = 'transferencia' and t.to_account_id = a.id then t.amount
      end), 0) as balance
from accounts a
left join transactions t on t.account_id = a.id or t.to_account_id = a.id
group by a.id;

-- Categorías por defecto para cada usuario nuevo.
create function public.seed_default_categories() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into categories (user_id, name, kind, color) values
    (new.id, 'Sueldo', 'ingreso', '#10b981'),
    (new.id, 'Otros ingresos', 'ingreso', '#14b8a6'),
    (new.id, 'Alimentación', 'gasto', '#f59e0b'),
    (new.id, 'Transporte', 'gasto', '#3b82f6'),
    (new.id, 'Vivienda', 'gasto', '#8b5cf6'),
    (new.id, 'Servicios básicos', 'gasto', '#06b6d4'),
    (new.id, 'Salud', 'gasto', '#ef4444'),
    (new.id, 'Entretenimiento', 'gasto', '#ec4899'),
    (new.id, 'Educación', 'gasto', '#6366f1'),
    (new.id, 'Otros gastos', 'gasto', '#64748b');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.seed_default_categories();

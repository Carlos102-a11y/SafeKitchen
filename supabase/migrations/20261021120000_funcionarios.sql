-- SafeKitchen | Fase 2 | Cadastro centralizado de funcionarios
-- Migracao aditiva: nao altera nem remove dados, tabelas ou politicas existentes.

-- 1. Funcao para manter updated_at (nome exclusivo do projeto)
create or replace function public.sk_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Tabela de funcionarios
create table public.funcionarios (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  nome text not null,
  matricula text not null default '',
  setor text not null default '',
  funcao text not null default '',
  data_admissao date,
  data_desligamento date,
  situacao text not null default 'ativo',
  observacoes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint funcionarios_id_user_id_key unique (id, user_id),
  constraint funcionarios_nome_check check (btrim(nome) <> ''),
  constraint funcionarios_situacao_check
    check (situacao in ('ativo', 'desligado')),
  constraint funcionarios_periodo_check
    check (
      data_admissao is null
      or data_desligamento is null
      or data_desligamento >= data_admissao
    ),
  constraint funcionarios_ativo_check
    check (situacao = 'desligado' or data_desligamento is null)
);

create unique index funcionarios_user_matricula_key
  on public.funcionarios (user_id, lower(btrim(matricula)))
  where btrim(matricula) <> '';

create index funcionarios_user_nome_idx
  on public.funcionarios (user_id, lower(nome));

create trigger funcionarios_set_updated_at
  before update on public.funcionarios
  for each row execute function public.sk_set_updated_at();

-- 3. Seguranca (RLS)
alter table public.funcionarios enable row level security;

revoke all on table public.funcionarios from anon;
grant select, insert, update, delete on table public.funcionarios to authenticated;

create policy "Funcionarios selecionar proprio usuario"
  on public.funcionarios for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Funcionarios inserir proprio usuario"
  on public.funcionarios for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Funcionarios atualizar proprio usuario"
  on public.funcionarios for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Funcionarios excluir proprio usuario"
  on public.funcionarios for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 4. Vinculo opcional em acidentes (aditivo; o nome em texto continua obrigatorio)
alter table public.acidentes add column funcionario_id bigint;

alter table public.acidentes
  add constraint acidentes_id_user_id_key unique (id, user_id);

alter table public.acidentes
  add constraint acidentes_funcionario_fkey
  foreign key (funcionario_id, user_id)
  references public.funcionarios (id, user_id)
  on delete set null (funcionario_id);

create index acidentes_funcionario_id_idx
  on public.acidentes (funcionario_id)
  where funcionario_id is not null;